from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from models import StandardResponseModel
from .task import router as commands_router
from .automate import router as automate_router


app = FastAPI(title="RemoteOC", description="RemoteOC的服务端", version="1.0.0")


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """
    捕获 HTTPException 并将其转化为 200 响应
    """
    return JSONResponse(
        status_code=500 if exc.status_code == 500 else 200,
        content=StandardResponseModel(
            code=exc.status_code,
            message=exc.detail,
            data=None,
        ).dict(),
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(commands_router, prefix="/api/task", tags=["task"])
app.include_router(automate_router, prefix="/api/automate", tags=["automate"])
