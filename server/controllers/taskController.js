import asyncHandler from "express-async-handler";
import Notice from "../models/notis.js";
import Task from "../models/taskModel.js";
import User from "../models/userModel.js";

const createTask = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, team, stage, date, priority, assets, links, description } = req.body;

    const prioridadeMap = {
      low: "BAIXA",
      normal: "NORMAL",
      medium: "MÉDIA",
      high: "ALTA",
    };

    const users = await User.find({ _id: team });
    const activeUsers = users.filter((user) => user.isActive === true);

    let newLinks = [];
    if (Array.isArray(links)) {
      newLinks = links;
    } else if (typeof links === "string" && links.trim() !== "") {
      newLinks = links.split(",").map((l) => l.trim());
    }

    const nomes = activeUsers.map((u) => u.name).join(", ");
    const activityText = `Uma nova tarefa foi atribuída a: ${nomes}. A prioridade é ${
      prioridadeMap[priority?.toLowerCase()] || "NORMAL"
    }, com data prevista para ${new Date(date).toLocaleDateString("pt-BR")}. Verifique e aja de acordo.`;

    const activity = {
      type: "assigned",
      activity: activityText,
      by: userId,
    };

    const task = await Task.create({
      title,
      team,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      assets,
      activities: [activity],
      links: newLinks,
      description,
    });

    for (const user of activeUsers) {
      const outros = activeUsers
        .filter((u) => u._id.toString() !== user._id.toString())
        .map((u) => u.name);

      let text = "";
      if (outros.length > 0) {
        text = `Uma nova tarefa foi atribuída a você e para ${outros.join(", ")}.`;
      } else {
        text = "Uma nova tarefa foi atribuída a você.";
      }

      text += ` A prioridade da tarefa é ${
        prioridadeMap[priority?.toLowerCase()] || "NORMAL"
      }, com data prevista para ${new Date(date).toLocaleDateString(
        "pt-BR"
      )}. Verifique e aja de acordo.`;

      await Notice.create({
        team: [user._id],
        text,
        task: task._id,
      });

      await User.findByIdAndUpdate(user._id, { $push: { tasks: task._id } });
    }

    res.status(200).json({
      status: true,
      task,
      message: "Tarefa criada e notificações enviadas com sucesso.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});


const duplicateTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Tarefa não encontrada." });
    }

    const prioridadeMap = {
      low: "BAIXA",
      normal: "NORMAL",
      medium: "MÉDIA",
      high: "ALTA",
    };

    const users = await User.find({ _id: task.team });
    const activeUsers = users.filter((user) => user.isActive === true);

    const nomes = activeUsers.map((u) => u.name).join(", ");
    const activityText = `Uma nova tarefa foi atribuída a: ${nomes}. A prioridade é ${
      prioridadeMap[task.priority?.toLowerCase()] || "NORMAL"
    }, com data prevista para ${new Date(task.date).toLocaleDateString(
      "pt-BR"
    )}. Verifique e aja de acordo.`;

    const activity = {
      type: "assigned",
      activity: activityText,
      by: userId,
    };


    const newTask = await Task.create({
      title: "Duplicada - " + task.title,
      team: task.team,
      subTasks: task.subTasks,
      assets: task.assets,
      links: task.links,
      priority: task.priority,
      stage: task.stage,
      activities: [activity],
      description: task.description,
      date: task.date,
    });

    for (const user of activeUsers) {
      const outros = activeUsers
        .filter((u) => u._id.toString() !== user._id.toString())
        .map((u) => u.name);

      let text = "";
      if (outros.length > 0) {
        text = `Uma nova tarefa foi atribuída a você e para ${outros.join(", ")}.`;
      } else {
        text = "Uma nova tarefa foi atribuída a você.";
      }

      text += ` A prioridade da tarefa é ${
        prioridadeMap[task.priority?.toLowerCase()] || "NORMAL"
      }, com data prevista para ${new Date(task.date).toLocaleDateString(
        "pt-BR"
      )}. Verifique e aja de acordo.`;

      await Notice.create({
        team: [user._id],
        text,
        task: newTask._id,
      });

      await User.findByIdAndUpdate(user._id, { $push: { tasks: newTask._id } });
    }

    res.status(200).json({
      status: true,
      message: "Tarefa duplicada e notificações enviadas com sucesso.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { title, date, team, stage, priority, assets, links, description } = req.body;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Tarefa não encontrada." });
    }

    let newLinks = [];
    if (Array.isArray(links)) {
      newLinks = links;
    } else if (typeof links === "string" && links.trim() !== "") {
      newLinks = links.split(",").map((l) => l.trim());
    }

    task.title = title || task.title;
    task.date = date || task.date;
    task.priority = priority?.toLowerCase() || task.priority;
    task.assets = assets || task.assets;
    task.stage = stage?.toLowerCase() || task.stage;
    task.team = team || task.team;
    task.links = newLinks.length > 0 ? newLinks : task.links;
    task.description = description || task.description;

    const users = await User.find({ _id: task.team });
    const activeUsers = users.filter((u) => u.isActive === true);

    const prioridadeMap = {
      low: "BAIXA",
      normal: "NORMAL",
      medium: "MÉDIA",
      high: "ALTA",
    };

    const nomes = activeUsers.map((u) => u.name).join(", ");
    const activityText = `A tarefa foi atualizada e está atribuída a: ${nomes}. A prioridade é ${
      prioridadeMap[task.priority?.toLowerCase()] || "NORMAL"
    }, com data prevista para ${new Date(task.date).toLocaleDateString(
      "pt-BR"
    )}.`;

    task.activities.push({
      type: "update",
      activity: activityText,
      by: userId,
    });

    await task.save();

    for (const user of activeUsers) {
      const outros = activeUsers
        .filter((u) => u._id.toString() !== user._id.toString())
        .map((u) => u.name);

      let text = "";
      if (outros.length > 0) {
        text = `A tarefa "${task.title}" foi atualizada. Ela está atribuída a você e para ${outros.join(", ")}.`;
      } else {
        text = `A tarefa "${task.title}" foi atualizada e está atribuída a você.`;
      }

      text += ` A prioridade atual é ${
        prioridadeMap[task.priority?.toLowerCase()] || "NORMAL"
      }, com data prevista para ${new Date(task.date).toLocaleDateString(
        "pt-BR"
      )}.`;

      await Notice.create({
        team: [user._id],
        text,
        task: task._id,
      });
    }

    res.status(200).json({ status: true, message: "Tarefa atualizada e notificações enviadas com sucesso." });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ status: false, message: error.message });
  }
});


const updateTaskStage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    const task = await Task.findById(id);

    task.stage = stage.toLowerCase();

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "A etapa da tarefa foi alterada com sucesso." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const updateSubTaskStage = asyncHandler(async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const { status } = req.body;

    await Task.findOneAndUpdate(
      {
        _id: taskId,
        "subTasks._id": subTaskId,
      },
      {
        $set: {
          "subTasks.$.isCompleted": status,
        },
      }
    );

    res.status(200).json({
      status: true,
      message: status
        ? "A tarefa foi marcada como concluída"
        : "A tarefa foi marcada como não concluída",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
});

const createSubTask = asyncHandler(async (req, res) => {
  const { title, tag, date } = req.body;
  const { id } = req.params;

  try {
    const newSubTask = {
      title,
      date,
      tag,
      isCompleted: false,
    };

    const task = await Task.findById(id);

    task.subTasks.push(newSubTask);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Subtarefa adicionada com sucesso." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { taskId, subTaskId } = req.params;
  const { title, tag, date } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ status: false, message: "Tarefa não encontrada" });
    }

    const subTask = task.subTasks.id(subTaskId);
    if (!subTask) {
      return res.status(404).json({ status: false, message: "Subtarefa não encontrada " });
    }

    if (title !== undefined) subTask.title = title;
    if (tag !== undefined) subTask.tag = tag;
    if(date !== undefined) subTask.date = date;

    await task.save();

    res.status(200).json({ status: true, message: "Subtarefa atualizada com sucesso.", subTask });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
});

const getTasks = asyncHandler(async (req, res) => {
  const { userId, isAdmin } = req.user;
  const { stage, isTrashed, search } = req.query;

  let query = { isTrashed: isTrashed ? true : false };

  if (!isAdmin) {
    query.team = { $all: [userId] };
  }
  if (stage) {
    query.stage = stage;
  }

  if (search) {
    const searchQuery = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { stage: { $regex: search, $options: "i" } },
        { priority: { $regex: search, $options: "i" } },
      ],
    };
    query = { ...query, ...searchQuery };
  }

  let queryResult = Task.find(query)
    .populate({
      path: "team",
      select: "name title email",
    })
    .sort({ _id: -1 });

  const tasks = await queryResult;

  res.status(200).json({
    status: true,
    tasks,
  });
});

const getTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate({
        path: "team",
        select: "name title role email",
      })
      .populate({
        path: "activities.by",
        select: "name",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      status: true,
      task,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch task", error);
  }
});

const postTaskActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { type, activity } = req.body;


  const task = await Task.findById(id);

  if (!task) {
    res.status(404);
    throw new Error("Tarefa não encontrada");
  }

  const data = { type, activity, by: userId };
  task.activities.push(data);
  await task.save();

  if (type === "bug" || activity.toLowerCase().includes("bug")) {
    
    const user = await User.findById(userId).select("name");
    const admins = await User.find({ role: "admin" });

     console.log("Admins alertados:", admins.map(a => a._id));

    if (admins.length > 0) {
      await Notice.create({
        team: admins.map(a => a._id),
        text: `${user.name} adicionou um problema na tarefa "${task.title}": ${activity}`,
        task: task._id,
        notiType: "alert",
      });
    }
  }

  res.status(200).json({ message: "Atividade adicionada com sucesso", task });
});

// remove uma atividade
const deleteTaskActivity = asyncHandler(async (req, res) => {
  const { taskId, activityId } = req.params;

  const task = await Task.findById(taskId);

  if (!task) {
    return res.status(404).json({ status: false, message: "Tarefa não encontrada" });
  }

  const newActivities = task.activities.filter(
    (activity) => activity._id.toString() !== activityId
  );

  task.activities = newActivities;
  await task.save();

  res.status(200).json({ status: true, message: "Atividade removida com sucesso", task });
});


const trashTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);

    task.isTrashed = true;

    await task.save();

    res.status(200).json({
      status: true,
      message: `Tarefa movida para a lixeira com sucesso.`,
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const deleteRestoreTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;

    if (actionType === "delete") {
      await Task.findByIdAndDelete(id);
    } else if (actionType === "deleteAll") {
      await Task.deleteMany({ isTrashed: true });
    } else if (actionType === "restore") {
      const resp = await Task.findById(id);

      resp.isTrashed = false;

      resp.save();
    } else if (actionType === "restoreAll") {
      await Task.updateMany(
        { isTrashed: true },
        { $set: { isTrashed: false } }
      );
    }

    res.status(200).json({
      status: true,
      message: `Operação realizada com sucesso.`,
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const { taskId, subTaskId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ status: false, message: "Tarefa não encontrada" });
    }

    task.subTasks = task.subTasks.filter(sub => sub._id.toString() !== subTaskId);
    await task.save();

    res.status(200).json({ status: true, message: "Subtarefa excluída com sucesso." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const dashboardStatistics = asyncHandler(async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;

    // fetch all tasks from the database
    const allTasks = isAdmin
      ? await Task.find({
          isTrashed: false,
        })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .sort({ _id: -1 })
      : await Task.find({
          isTrashed: false,
          team: { $all: [userId] },
        })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .sort({ _id: -1 });

    const users = await User.find({ isActive: true })
      .select("name title role isActive createdAt")
      .limit(10)
      .sort({ _id: -1 });

    // Group tasks by stage and calculate counts
    const groupedTasks = allTasks?.reduce((result, task) => {
      const stage = task.stage;

      if (!result[stage]) {
        result[stage] = 1;
      } else {
        result[stage] += 1;
      }

      return result;
    }, {});

    const graphData = Object.entries(
      allTasks?.reduce((result, task) => {
        const { priority } = task;
        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    // Calculate total tasks
    const totalTasks = allTasks.length;
    const last10Task = allTasks?.slice(0, 10);

    // Combine results into a summary object
    const summary = {
      totalTasks,
      last10Task,
      users: isAdmin ? users : [],
      tasks: groupedTasks,
      graphData,
    };

    res
      .status(200)
      .json({ status: true, ...summary, message: "Successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
});

export {
  createSubTask, //
  createTask, //
  dashboardStatistics, //
  deleteRestoreTask, //
  duplicateTask, //
  getTask, //
  getTasks, // 
  postTaskActivity, //
  trashTask, //
  updateSubTaskStage, //
  updateTask, //
  updateTaskStage, //
  deleteTaskActivity,
  deleteSubTask,
  updateSubTask,
};
