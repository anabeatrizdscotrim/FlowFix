import express from "express";
import {
  createSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  deleteSubTask,
  deleteTaskActivity,
  duplicateTask,
  getTask,
  getTasks,
  postTaskActivity,
  trashTask,
  updateSubTask,
  updateSubTaskStage,
  updateTask,
  updateTaskStage,
} from "../controllers/taskController.js";
import { isAdminRoute, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protectRoute, isAdminRoute, createTask);
router.post("/duplicate/:id", protectRoute, isAdminRoute, duplicateTask);
router.post("/activity/:id", protectRoute, postTaskActivity);

router.get("/dashboard", protectRoute, dashboardStatistics);
router.get("/", protectRoute, getTasks);
router.get("/:id", protectRoute, getTask);

router.put("/create-subtask/:id", protectRoute, isAdminRoute, createSubTask);
router.put("/update/:id", protectRoute, isAdminRoute, updateTask);
router.put("/change-stage/:id", protectRoute, updateTaskStage);
router.put("/change-status/:taskId/:subTaskId", protectRoute, updateSubTaskStage);
router.put("/:id", protectRoute, isAdminRoute, trashTask);
router.patch("/subtasks/:taskId/:subTaskId", protectRoute, isAdminRoute, updateSubTask);


router.delete("/delete-restore/:id?", protectRoute, isAdminRoute, deleteRestoreTask);
router.delete("/activity/:taskId/:activityId", protectRoute, deleteTaskActivity);
router.delete("/:taskId/subtasks/:subTaskId", protectRoute, isAdminRoute, deleteSubTask);

export default router;
