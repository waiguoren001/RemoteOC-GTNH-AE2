from datetime import datetime
import json
import os
from .utils import logger, READY, PENDING, COMPLETED


class TaskManager:
    def __init__(self, file_dir="tasks"):
        """
        初始化任务管理器
        :param file_dir: 任务文件存储的目录
        """
        self.file_dir = file_dir
        if not os.path.exists(self.file_dir):
            os.makedirs(self.file_dir)

    def add_task(self, task_id: str, client_id: str, commands: list, status=READY, is_chunked=False) -> None:
        """
        添加任务
        :param task_id: 任务ID
        :param client_id: 客户ID
        :param commands: 命令列表
        :param status: 任务状态，默认状态为READY
        :param is_chunked: 是否为分块上传的任务
        """
        task_data = {
            'client_id': client_id,
            'commands': commands,
            'status': status,
            'chunked': is_chunked,  # 标识是否为分块任务
            'created_time': datetime.now().isoformat(),  # 任务创建时间
            'pending_time': None,  # Pending状态的时间
            'completed_time': None  # 任务结束时间
        }
        file_path = os.path.join(self.file_dir, f"{task_id}.json")
        with open(file_path, "w") as file:
            json.dump(task_data, file)
        logger.debug('Add task: %s %s %s %s', task_id, client_id, commands, status)

    def update_task(self, task_id, status=None, results=None):
        """
        更新任务的状态和结果
        :param task_id: 任务ID
        :param status: 新的任务状态
        :param results: 任务的结果
        """
        logger.debug('Update task: %s %s %s', task_id, status, results)
        task = self.get_task(task_id)
        if not task:
            return False  # 如果任务不存在，则返回 False

        if status:
            task['status'] = status
            if status == READY:
                task['created_time'] = datetime.now().isoformat()  # 记录创建状态的时间（使用缓存时）
            elif status == PENDING:
                task['pending_time'] = datetime.now().isoformat()  # 记录Pending状态的时间
            elif status == COMPLETED:
                task['completed_time'] = datetime.now().isoformat()  # 记录任务结束的时间
        if results:
            task['results'] = results

        # 将更新后的任务重新保存到文件中
        file_path = os.path.join(self.file_dir, f"{task_id}.json")
        with open(file_path, "w") as file:
            json.dump(task, file)
        return True

    def get_task(self, task_id) -> dict | None:
        """
        获取任务
        :param task_id: 任务ID
        :return: 任务数据（字典形式），如果任务不存在则返回None
        """
        # logger.debug('Get task: %s', task_id)
        file_path = os.path.join(self.file_dir, f"{task_id}.json")
        if os.path.exists(file_path):
            with open(file_path, "r") as file:
                return json.load(file)
        return None

    def remove_task(self, task_id) -> None:
        """
        删除任务
        :param task_id: 任务ID
        """
        logger.debug('Remove task: %s', task_id)
        file_path = os.path.join(self.file_dir, f"{task_id}.json")
        if os.path.exists(file_path):
            os.remove(file_path)

    def task_exists(self, task_id) -> bool:
        """
        检查任务是否存在
        :param task_id: 任务ID
        :return: True 如果任务存在，False 如果任务不存在
        """
        logger.debug('Task Exists: %s', task_id)
        file_path = os.path.join(self.file_dir, f"{task_id}.json")
        return os.path.exists(file_path)

    def list_tasks(self) -> list:
        """
        列出所有任务ID
        :return: 任务ID列表
        """
        task_list = [file_name.replace(".json", "") for file_name in os.listdir(self.file_dir) if file_name.endswith(".json")]
        logger.debug('Get task list: %s', task_list)
        return task_list


task_manager = TaskManager()