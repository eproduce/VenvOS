"""文件管理服务"""
from __future__ import annotations

import os
import shutil
import stat
from datetime import datetime
from pathlib import Path


class FileService:
    """提供文件系统操作服务"""

    @staticmethod
    def list_directory(path: str) -> list[dict]:
        """列出目录内容"""
        target = Path(path).resolve()
        if not target.exists():
            return []
        if not target.is_dir():
            target = target.parent

        items = []
        try:
            for entry in sorted(target.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower())):
                try:
                    st = entry.stat()
                    items.append({
                        "name": entry.name,
                        "path": str(entry),
                        "type": "directory" if entry.is_dir() else "file",
                        "size": st.st_size,
                        "modified": datetime.fromtimestamp(st.st_mtime).isoformat(),
                        "created": datetime.fromtimestamp(st.st_ctime).isoformat(),
                        "permissions": oct(st.st_mode)[-3:],
                        "extension": entry.suffix.lower() if entry.is_file() else "",
                    })
                except OSError:
                    continue
        except PermissionError:
            pass

        return items

    @staticmethod
    def get_file_info(path: str) -> dict | None:
        """获取单个文件/目录信息"""
        target = Path(path).resolve()
        if not target.exists():
            return None
        st = target.stat()
        return {
            "name": target.name,
            "path": str(target),
            "type": "directory" if target.is_dir() else "file",
            "size": st.st_size,
            "modified": datetime.fromtimestamp(st.st_mtime).isoformat(),
            "created": datetime.fromtimestamp(st.st_ctime).isoformat(),
            "permissions": oct(st.st_mode)[-3:],
            "extension": target.suffix.lower() if target.is_file() else "",
        }

    @staticmethod
    def create_directory(path: str) -> dict:
        """创建目录"""
        target = Path(path).resolve()
        target.mkdir(parents=True, exist_ok=True)
        return {"success": True, "path": str(target)}

    @staticmethod
    def create_file(path: str, content: str = "") -> dict:
        """创建文件"""
        target = Path(path).resolve()
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
        return {"success": True, "path": str(target)}

    @staticmethod
    def read_file(path: str) -> dict:
        """读取文件内容"""
        target = Path(path).resolve()
        if not target.exists() or not target.is_file():
            return {"error": "文件不存在"}
        content = target.read_text(encoding="utf-8")
        return {"content": content, "path": str(target), "size": len(content)}

    @staticmethod
    def write_file(path: str, content: str) -> dict:
        """写入文件内容"""
        target = Path(path).resolve()
        target.write_text(content, encoding="utf-8")
        return {"success": True, "path": str(target)}

    @staticmethod
    def delete_item(path: str) -> dict:
        """删除文件或目录"""
        target = Path(path).resolve()
        if not target.exists():
            return {"error": "路径不存在"}
        if target.is_dir():
            shutil.rmtree(str(target))
        else:
            target.unlink()
        return {"success": True, "path": str(target)}

    @staticmethod
    def rename_item(old_path: str, new_name: str) -> dict:
        """重命名文件或目录"""
        target = Path(old_path).resolve()
        if not target.exists():
            return {"error": "路径不存在"}
        new_path = target.parent / new_name
        target.rename(new_path)
        return {"success": True, "old_path": str(target), "new_path": str(new_path)}

    @staticmethod
    def move_item(src: str, dst: str) -> dict:
        """移动文件或目录"""
        src_path = Path(src).resolve()
        dst_path = Path(dst).resolve()
        if not src_path.exists():
            return {"error": "源路径不存在"}
        shutil.move(str(src_path), str(dst_path))
        return {"success": True, "src": str(src_path), "dst": str(dst_path)}

    @staticmethod
    def copy_item(src: str, dst: str) -> dict:
        """复制文件或目录"""
        src_path = Path(src).resolve()
        dst_path = Path(dst).resolve()
        if not src_path.exists():
            return {"error": "源路径不存在"}
        if src_path.is_dir():
            shutil.copytree(str(src_path), str(dst_path))
        else:
            shutil.copy2(str(src_path), str(dst_path))
        return {"success": True, "src": str(src_path), "dst": str(dst_path)}

    @staticmethod
    def search_files(directory: str, query: str) -> list[dict]:
        """搜索文件"""
        results = []
        base = Path(directory).resolve()
        if not base.exists():
            return []
        query_lower = query.lower()
        for root, dirs, files in os.walk(str(base)):
            for name in dirs + files:
                if query_lower in name.lower():
                    full_path = Path(root) / name
                    try:
                        st = full_path.stat()
                        results.append({
                            "name": name,
                            "path": str(full_path),
                            "type": "directory" if full_path.is_dir() else "file",
                            "size": st.st_size,
                            "modified": datetime.fromtimestamp(st.st_mtime).isoformat(),
                        })
                    except OSError:
                        continue
        return results
