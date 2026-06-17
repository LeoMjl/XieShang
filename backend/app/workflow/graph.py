from langgraph.graph import StateGraph, END
from typing import TypedDict
from app.core.state import XieshangState
from app.agents.profiling import profiling_node
from app.agents.avatar_generator import avatar_generator_node
from app.agents.styling import styling_node
from app.agents.tryon import tryon_node

def route_flow(state: XieshangState) -> str:
    """
    路由逻辑：根据传入的状态字段判断执行哪一条核心业务流。
    """
    # 1. 如果包含上传的商品照片，则进入“指定商品试穿流”
    if state.get("uploaded_product_url"):
        return "tryon"
    
    # 2. 如果包含文本查询，则进入“智能穿搭推荐试穿流”
    if state.get("user_query"):
        return "styling"
        
    # 3. 否则默认为“用户形象固化流”
    return "profiling"

# 初始化 StateGraph
workflow = StateGraph(XieshangState)

# 注册节点
workflow.add_node("profiling", profiling_node)
workflow.add_node("avatar_generator", avatar_generator_node)
workflow.add_node("styling", styling_node)
workflow.add_node("tryon", tryon_node)

# 设置条件起点
workflow.set_conditional_entry_point(
    route_flow,
    {
        "tryon": "tryon",
        "styling": "styling",
        "profiling": "profiling"
    }
)

# --- 业务流 1: 用户形象固化流 ---
workflow.add_edge("profiling", "avatar_generator")
workflow.add_edge("avatar_generator", END)

# --- 业务流 2: 智能穿搭推荐试穿流 ---
workflow.add_edge("styling", "tryon")

# --- 业务流 3 & 业务流 2 的终点 ---
workflow.add_edge("tryon", END)

# 编译图
app_workflow = workflow.compile()
