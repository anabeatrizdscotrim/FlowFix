import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, useState } from "react";
import { AiTwotoneFolderOpen } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { FaExchangeAlt } from "react-icons/fa";
import { HiDuplicate } from "react-icons/hi";
import { MdAdd, MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useChangeTaskStageMutation,
  useDuplicateTaskMutation,
  useTrashTastMutation,
} from "../../redux/slices/api/taskApiSlice";
import ConfirmatioDialog from "../ConfirmationDialog";
import AddSubTask from "./AddSubTask";
import AddTask from "./AddTask";
import TaskColor from "./TaskColor";
import { useSelector } from "react-redux";

const CustomTransition = ({ children }) => (
  <Transition
    as={Fragment}
    enter="transition ease-out duration-100"
    enterFrom="transform opacity-0 scale-95"
    enterTo="transform opacity-100 scale-100"
    leave="transition ease-in duration-75"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-95"
  >
    {children}
  </Transition>
);

const ChangeTaskActions = ({ _id, stage }) => {
  const [changeStage] = useChangeTaskStageMutation();

  const changeHandler = async (val) => {
    try {
      const data = { id: _id, stage: val };
      const res = await changeStage(data).unwrap();
      toast.success(res?.message);
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const stageItems = [
    { label: "Para Fazer", stage: "todo", icon: <TaskColor className="bg-blue-400" /> },
    { label: "Em Progresso", stage: "in progress", icon: <TaskColor className="bg-yellow-400" /> },
    { label: "Finalizado", stage: "completed", icon: <TaskColor className="bg-green-400" /> },
  ];

  return (
    <Menu as="div" className="relative inline-block text-left w-full">
      <Menu.Button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">
        <FaExchangeAlt />
        <span>Mudar Status</span>
      </Menu.Button>

      <CustomTransition>
        <Menu.Items className="absolute left-0 mt-2 w-40 rounded-md bg-white shadow-lg ring-1 ring-black/5 z-50 isolate focus:outline-none">
          <div className="px-1 py-1 space-y-1">
            {stageItems.map((el) => (
              <Menu.Item key={el.label} disabled={stage === el.stage}>
                {({ active }) => (
                  <button
                    disabled={stage === el.stage}
                    onClick={() => changeHandler(el.stage)}
                    className={clsx(
                      active ? "bg-gray-200 text-gray-900" : "text-gray-900",
                      "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm disabled:opacity-50"
                    )}
                  >
                    {el.icon}
                    {el.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </CustomTransition>
    </Menu>
  );
};

export default function TaskDialog({ task }) {
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const navigate = useNavigate();
  const [deleteTask] = useTrashTastMutation();
  const [duplicateTask] = useDuplicateTaskMutation();

  const deleteHandler = async () => {
    try {
      const res = await deleteTask({ id: task._id, isTrashed: "trash" }).unwrap();
      toast.success(res?.message);
      setTimeout(() => {
        setOpenDialog(false);
        window.location.reload();
      }, 500);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const duplicateHandler = async () => {
    try {
      const res = await duplicateTask(task._id).unwrap();
      toast.success(res?.message);
      setTimeout(() => {
        setOpenDialog(false);
        window.location.reload();
      }, 500);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const menuItems = [
    { label: "Abrir Tarefa", icon: <AiTwotoneFolderOpen className="mr-2 h-5 w-5" />, onClick: () => navigate(`/task/${task._id}`) },
    { label: "Editar", icon: <MdOutlineEdit className="mr-2 h-5 w-5" />, onClick: () => setOpenEdit(true) },
    { label: "Adicionar Subtarefa", icon: <MdAdd className="mr-2 h-5 w-5" />, onClick: () => setOpen(true) },
    { label: "Duplicar Tarefa", icon: <HiDuplicate className="mr-2 h-5 w-5" />, onClick: duplicateHandler },
  ];

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">
          <BsThreeDots />
        </Menu.Button>

        <CustomTransition>
          <Menu.Items className="absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5 z-50 isolate focus:outline-none">
            <div className="px-1 py-1 space-y-1">
              {menuItems.map((el, index) => (
                <Menu.Item key={el.label}>
                  {({ active }) => (
                    <button
                      disabled={index !== 0 && !user.isAdmin}
                      onClick={el.onClick}
                      className={clsx(
                        active ? "bg-black text-white" : "text-gray-900",
                        "flex w-full items-center rounded-md px-2 py-2 text-sm disabled:text-gray-400"
                      )}
                    >
                      {el.icon}
                      {el.label}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>

            <div className="px-1 py-1">
              <ChangeTaskActions id={task._id} {...task} />
            </div>

            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    disabled={!user.isAdmin}
                    onClick={() => setOpenDialog(true)}
                    className={clsx(
                      active ? "bg-red-100 text-red-500" : "text-red-500",
                      "flex w-full items-center rounded-md px-2 py-2 text-sm disabled:text-gray-400"
                    )}
                  >
                    <RiDeleteBin6Line className="mr-2 h-5 w-5 text-red-500" />
                    Deletar
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </CustomTransition>
      </Menu>

      {/* Modais */}
      <AddTask open={openEdit} setOpen={setOpenEdit} task={task} key={new Date().getTime()} />
      <AddSubTask open={open} setOpen={setOpen} id={task._id} />
      <ConfirmatioDialog open={openDialog} setOpen={setOpenDialog} onClick={deleteHandler} />
    </>
  );
}
