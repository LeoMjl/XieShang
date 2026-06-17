import os
import shutil
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form, WebSocket, WebSocketDisconnect
import json
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.db.database import engine, Base, get_db
from app.db import models
from app.workflow.graph import app_workflow

# 创建上传目录
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 自动创建表
Base.metadata.create_all(bind=engine)

app = FastAPI(title="偕裳 MVP API", description="个性化虚拟试穿平台核心调度接口")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态目录，用于访问上传的图片
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    通用文件上传接口，返回本地可访问的 URL
    """
    import uuid
    file_id = str(uuid.uuid4())[:8]
    file_path = os.path.join(UPLOAD_DIR, f"upload_{file_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    url = f"http://localhost:8000/uploads/{os.path.basename(file_path)}"
    return {"status": "success", "url": url}

@app.get("/")
def read_root():
    return {"message": "Welcome to Xieshang MVP API"}

@app.websocket("/ws/process")
async def websocket_process(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()
    try:
        # Receive the first message as JSON
        data = await websocket.receive_text()
        payload = json.loads(data)
        
        flow_type = payload.get("type")
        user_id = payload.get("user_id")
        
        if not flow_type or not user_id:
            await websocket.send_json({"status": "error", "message": "Missing type or user_id"})
            await websocket.close()
            return
            
        initial_state = {}
        
        if flow_type == "onboarding":
            height = payload.get("height")
            weight = payload.get("weight")
            file_url = payload.get("file_url")
            initial_state = {
                "user_id": user_id,
                "height": height,
                "weight": weight,
                "original_photo_url": file_url,
            }
            
        elif flow_type == "recommendation":
            query = payload.get("query")
            db_profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()
            if not db_profile or not db_profile.base_avatar_url:
                await websocket.send_json({"status": "error", "message": "User profile not initialized."})
                await websocket.close()
                return
            initial_state = {
                "user_id": user_id,
                "height": db_profile.height,
                "weight": db_profile.weight,
                "base_avatar_url": db_profile.base_avatar_url,
                "user_profile_tags": db_profile.user_profile_tags,
                "user_query": query,
            }
            
        elif flow_type == "direct-tryon":
            file_url = payload.get("file_url")
            db_profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()
            if not db_profile or not db_profile.base_avatar_url:
                await websocket.send_json({"status": "error", "message": "User profile not initialized."})
                await websocket.close()
                return
            initial_state = {
                "user_id": user_id,
                "base_avatar_url": db_profile.base_avatar_url,
                "uploaded_product_url": file_url,
            }
        else:
            await websocket.send_json({"status": "error", "message": "Unknown flow type"})
            await websocket.close()
            return
            
        # Start astream
        final_result = {}
        async for event in app_workflow.astream(initial_state, config={"configurable": {"thread_id": user_id}}):
            for node_name, state in event.items():
                # Send progress update to frontend
                await websocket.send_json({
                    "status": "progress",
                    "node": node_name
                })
                # Update final result
                final_result.update(state)
                
        # Handle database updates
        if flow_type == "onboarding":
            db_profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()
            if not db_profile:
                db_profile = models.UserProfile(user_id=user_id)
                db.add(db_profile)
            
            db_profile.height = final_result.get("height")
            db_profile.weight = final_result.get("weight")
            db_profile.original_photo_url = final_result.get("original_photo_url")
            db_profile.base_avatar_url = final_result.get("base_avatar_url")
            db_profile.user_profile_tags = final_result.get("user_profile_tags")
            db.commit()
            
            await websocket.send_json({
                "status": "success",
                "avatar_url": db_profile.base_avatar_url
            })
            
        elif flow_type == "recommendation":
            await websocket.send_json({
                "status": "success",
                "styling_suggestion": final_result.get("styling_suggestion"),
                "generated_product_url": final_result.get("generated_product_url"),
                "final_tryon_url": final_result.get("final_tryon_url")
            })
            
        elif flow_type == "direct-tryon":
            await websocket.send_json({
                "status": "success",
                "final_tryon_url": final_result.get("final_tryon_url")
            })
            
        await websocket.close()
        
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.send_json({"status": "error", "message": str(e)})
            await websocket.close()
        except:
            pass

@app.post("/api/onboarding")
async def onboarding_flow(
    user_id: str = Form(...),
    height: int = Form(...),
    weight: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    业务流 1: 用户形象固化流 (Onboarding Flow)
    上传半身照 + 身体特征，通过大模型生成全身照并固化。
    """
    # 保存上传的文件
    file_path = os.path.join(UPLOAD_DIR, f"{user_id}_onboarding_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    original_photo_url = f"http://localhost:8000/uploads/{os.path.basename(file_path)}"
    
    # 构造状态流转的初始状态
    initial_state = {
        "user_id": user_id,
        "height": height,
        "weight": weight,
        "original_photo_url": original_photo_url,
    }
    
    # 运行 LangGraph (针对形象固化分支)
    result = await app_workflow.ainvoke(initial_state, config={"configurable": {"thread_id": user_id}})
    
    # 落库
    db_profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()
    if not db_profile:
        db_profile = models.UserProfile(user_id=user_id)
        db.add(db_profile)
    
    db_profile.height = result.get("height")
    db_profile.weight = result.get("weight")
    db_profile.original_photo_url = result.get("original_photo_url")
    db_profile.base_avatar_url = result.get("base_avatar_url")
    db_profile.user_profile_tags = result.get("user_profile_tags")
    db.commit()
    db.refresh(db_profile)
    
    return {"status": "success", "avatar_url": db_profile.base_avatar_url}

@app.post("/api/recommendation")
async def ai_styling_tryon_flow(
    user_id: str = Form(...),
    query: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    业务流 2: 智能穿搭推荐试穿流 (AI Styling & Try-On Flow)
    输入场景需求 -> 推荐穿搭 -> 生成商品图 -> 虚拟试穿
    """
    db_profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()
    if not db_profile or not db_profile.base_avatar_url:
        raise HTTPException(status_code=400, detail="User profile not initialized. Please complete onboarding first.")
    
    initial_state = {
        "user_id": user_id,
        "height": db_profile.height,
        "weight": db_profile.weight,
        "base_avatar_url": db_profile.base_avatar_url,
        "user_profile_tags": db_profile.user_profile_tags,
        "user_query": query,
    }
    
    result = await app_workflow.ainvoke(initial_state, config={"configurable": {"thread_id": user_id}})
    
    return {
        "status": "success",
        "styling_suggestion": result.get("styling_suggestion"),
        "generated_product_url": result.get("generated_product_url"),
        "final_tryon_url": result.get("final_tryon_url")
    }

@app.post("/api/direct-tryon")
async def direct_product_tryon_flow(
    user_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    业务流 3: 指定商品试穿流 (Direct Product Try-On Flow)
    直接上传商品图 -> 虚拟试穿
    """
    db_profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()
    if not db_profile or not db_profile.base_avatar_url:
        raise HTTPException(status_code=400, detail="User profile not initialized. Please complete onboarding first.")
        
    file_path = os.path.join(UPLOAD_DIR, f"{user_id}_product_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    uploaded_product_url = f"http://localhost:8000/uploads/{os.path.basename(file_path)}"
    
    initial_state = {
        "user_id": user_id,
        "base_avatar_url": db_profile.base_avatar_url,
        "uploaded_product_url": uploaded_product_url,
    }
    
    result = await app_workflow.ainvoke(initial_state, config={"configurable": {"thread_id": user_id}})
    
    return {
        "status": "success",
        "final_tryon_url": result.get("final_tryon_url")
    }
