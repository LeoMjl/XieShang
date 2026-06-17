import asyncio
import dashscope
from app.core.state import XieshangState
from app.core.config import settings

dashscope.api_key = settings.ALIYUN_API_KEY

async def tryon_node(state: XieshangState) -> dict:
    """
    虚拟试穿 Agent：接收商品图(不论是 AI 生成还是用户上传)和基底全身照，调用图像融合模型。
    MVP 阶段直接调用万相生图模拟。
    """
    base_avatar = state.get("base_avatar_url")
    user_id = state.get("user_id")
    
    # 优先使用用户手动上传的商品图，否则使用 AI 生成的商品图
    target_garment = state.get("uploaded_product_url") or state.get("generated_product_url")
    
    print(f"--> [Try-On Worker] 开始融合试穿. \n人物图: {base_avatar}\n商品图: {target_garment}")
    
    if not base_avatar or not target_garment:
        return {"error_message": "试穿必须提供人物全身像和目标服装图片"}
    
    tags = state.get('user_profile_tags', {})
    
    prompt = f"根据提供的服装图片，将服装穿在提供的模特图片上。模特身高大约170cm，体型为{tags.get('body_shape', '匀称')}，肤色为{tags.get('skin_tone', '中性')}。保持模特的人脸特征、姿态完全不变，生成高逼真度的全身虚拟试穿照片。"
    
    # 将URL转换为DashScope要求的file://协议（如果是本地文件的话）
    import os
    
    def get_file_uri(url):
        if url.startswith("http://localhost:8000/uploads/"):
            file_name = url.split('/')[-1]
            local_file_path = os.path.abspath(os.path.join("uploads", file_name))
            return f"file://{local_file_path}"
        return url
        
    base_avatar_uri = get_file_uri(base_avatar)
    target_garment_uri = get_file_uri(target_garment)
    
    messages = [
        {
            "role": "user",
            "content": [
                {"image": base_avatar_uri},
                {"image": target_garment_uri},
                {"text": prompt}
            ]
        }
    ]
    
    def call_wanx():
        return dashscope.MultiModalConversation.call(
            model='wan2.7-image',
            messages=messages
        )
        
    try:
        wanx_resp = await asyncio.to_thread(call_wanx)
        if wanx_resp.status_code == 200:
            if wanx_resp.output and wanx_resp.output.choices:
                final_tryon_url = wanx_resp.output.choices[0].message.content[0].get('image')
                if final_tryon_url:
                    print(f"--> [Try-On Worker] 试穿生成成功: {final_tryon_url}")
                    return {"final_tryon_url": final_tryon_url}
            raise Exception(f"No results returned. Output: {wanx_resp.output}")
        else:
            raise Exception(wanx_resp.message)
    except Exception as e:
        print(f"--> [Try-On Worker] 发生错误: {str(e)}")
        # 降级返回 Mock 数据
        final_tryon_url = f"https://mock-oss.com/tryon/results/{user_id}/final_result.jpg"
        return {"final_tryon_url": final_tryon_url}
