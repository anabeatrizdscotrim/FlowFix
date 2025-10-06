import clsx from "clsx";
import moment from "moment";
import "moment/locale/pt-br";
import React, { useState } from "react";
import { FaSpinner} from "react-icons/fa";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdTaskAlt,
} from "react-icons/md";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button, Loading, Tabs } from "../components";
import { TaskColor } from "../components/tasks";
import {
  useChangeSubTaskStatusMutation,
  useGetSingleTaskQuery,
  usePostTaskActivityMutation,
} from "../redux/slices/api/taskApiSlice";
import {
  PRIOTITYSTYELS,
  TASK_TYPE,
  getCompletedSubTasks,
  getInitials,
} from "../utils";
import { CiCircleCheck } from "react-icons/ci";
import { PiUserCircleLight } from "react-icons/pi";
import { TbProgress } from "react-icons/tb";
import { BiCommentEdit } from "react-icons/bi";
import { AiOutlinePlayCircle } from "react-icons/ai";
import { GoAlert } from "react-icons/go";
import { CgDetailsLess } from "react-icons/cg";
import { Ri24HoursFill } from "react-icons/ri";

moment.locale("pt-br");

const assets = [
  "https://images.pexels.com/photos/2418664/pexels-photo-2418664.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/8797307/pexels-photo-8797307.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/2534523/pexels-photo-2534523.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/804049/pexels-photo-804049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
];

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const bgColor = {
  high: "bg-red-200",
  medium: "bg-yellow-200",
  low: "bg-blue-200",
};

const TABS = [
  { title: "Detalhes da Tarefa", icon: <CgDetailsLess /> },
  { title: "Timeline", icon: <Ri24HoursFill /> },
];

const TASKTYPEICON = {
  commented: (
    <div className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white'>
      <BiCommentEdit size={22} />
    </div>
  ),
  started: (
    <div className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white'>
      <AiOutlinePlayCircle  size={24} />
    </div>
  ),
  assigned: (
    <div className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white'>
      <PiUserCircleLight size={24} />
    </div>
  ),
  bug: (
    <div className='w-10 h-10 rounded-full bg-red-400 flex items-center justify-center text-white'>
      <GoAlert size={22} />
    </div>
  ),
  completed: (
    <div className='w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-white'>
      <CiCircleCheck size={24} />
    </div>
  ),
  "in progress": (
    <div className='w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-white'>
      <TbProgress size={24} />
    </div>
  ),
};

const TYPE_LABELS = {
  commented: "Comentário",
  started: "Iniciado",
  assigned: "Atribuído",
  bug: "Problema",
  completed: "Concluído",
  "in progress": "Em andamento",
};

/*
const act_types = [
  "Started",
  "Completed",
  "In Progress",
  "Commented",
  "Bug",
  "Assigned",
];*/

const act_types = [
  { value: "Started", label: "Iniciado" },
  { value: "Completed", label: "Concluído" },
  { value: "In Progress", label: "Em andamento" },
  { value: "Commented", label: "Comentado" },
  { value: "Bug", label: "Problema" },
  { value: "Assigned", label: "Atribuído" },
];


const PRIORITY_TRANSLATION = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  normal: "Normal"
};

const STATUS_TRANSLATION = {
  todo: "Para Fazer",
  "in progress": "Em Progresso",
  completed: "Finalizado",
};

const Activities = ({ activity, id, refetch }) => {
  const [selected, setSelected] = useState("Started");
  const [text, setText] = useState("");

  const [postActivity, { isLoading }] = usePostTaskActivityMutation();

  const handleSubmit = async () => {
    try {
      const data = {
        type: selected?.toLowerCase(),
        activity: text,
      };
      const res = await postActivity({
        data,
        id,
      }).unwrap();
      setText("");
      toast.success(res?.message);
      refetch();
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const Card = ({ item }) => {
    return (
      <div className={`flex space-x-4`}>
        <div className='flex flex-col items-center flex-shrink-0'>
          <div className='w-10 h-10 flex items-center justify-center'>
            {TASKTYPEICON[item?.type]}
          </div>
          <div className='h-full flex items-center'>
            <div className='w-0.5 bg-gray-300 h-full'></div>
          </div>
        </div>

        <div className='flex flex-col gap-y-1 mb-8'>
          <p className='font-semibold'>{item?.by?.name}</p>
          <div className='text-gray-500 space-x-2'>
            <span className='capitalize'>
              {TYPE_LABELS[item?.type] || item?.type}
            </span>
            <span className='text-sm'>{moment(item?.date).format("DD/MM/YYYY")}</span>
          </div>
          <div className='text-gray-700'>{item?.activity}</div>
        </div>
      </div>
    );
  };

  return (
    <div className='w-full flex gap-10 2xl:gap-20 min-h-screen px-10 py-8 bg-white shadow rounded-md justify-between overflow-y-auto'>
      <div className='w-full md:w-1/2'>
        <h4 className='text-gray-600 font-semibold text-lg mb-5'>Atividades</h4>
        <div className='w-full space-y-0'>
          {activity?.map((item, index) => (
            <Card
              key={item.id}
              item={item}
              isConnected={index < activity?.length - 1}
            />
          ))}
        </div>
      </div>

      <div className='w-full md:w-1/3'>
        <h4 className='text-gray-600 font-semibold text-lg mb-5'>
          Adicionar Atividade
        </h4>
        <div className='w-full flex flex-wrap gap-5'>
          {act_types.map((item) => (
            <div key={item.value} className='flex gap-2 items-center'>
              <input
                type='checkbox'
                className='w-4 h-4 border-black accent-black'
                checked={selected === item.value}
                onChange={() => setSelected(item.value)}
              />
              <p>{item.label}</p>
            </div>
          ))}
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Adicione uma descrição...'
            className='bg-white w-full mt-10 border border-gray-300 outline-none p-4 rounded-md focus:ring-2 ring-blue-500'
          ></textarea>
          {isLoading ? (
            <Loading />
          ) : (
            <Button
              type='button'
              label='Enviar'
              onClick={handleSubmit}
              className='bg-black text-white rounded hover:bg-gray-500'
            />
          )}
        </div>
      </div>
    </div>
  );
};

const TaskDetail = () => {
  const { id } = useParams();
  const { data, isLoading, refetch } = useGetSingleTaskQuery(id);
  const [subTaskAction, { isLoading: isSubmitting }] =
    useChangeSubTaskStatusMutation();

  const [selected, setSelected] = useState(0);
  const task = data?.task || [];

  const handleSubmitAction = async (el) => {
    try {
      const data = {
        id: el.id,
        subId: el.subId,
        status: !el.status,
      };
      const res = await subTaskAction({
        ...data,
      }).unwrap();

      toast.success(res?.message);
      refetch();
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  if (isLoading)
    <div className='py-10'>
      <Loading />
    </div>;

  const percentageCompleted =
    task?.subTasks?.length === 0
      ? 0
      : (getCompletedSubTasks(task?.subTasks) / task?.subTasks?.length) * 100;

  return (
    <div className='w-full flex flex-col gap-3 mb-4 overflow-y-hidden'>
      {/* task detail */}
      <h1 className='text-2xl text-gray-600 font-bold'>{task?.title}</h1>
      <Tabs tabs={TABS} setSelected={setSelected}>
        {selected === 0 ? (
          <>
            <div className='w-full flex flex-col md:flex-row gap-5 2xl:gap-8 bg-white shadow rounded-md px-8 py-8 overflow-y-auto'>
              <div className='w-full md:w-1/2 space-y-8'>
                <div className='flex items-center gap-5'>
                  <div
                    className={clsx(
                      "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
                      PRIOTITYSTYELS[task?.priority],
                      bgColor[task?.priority]
                    )}
                  >
                    <span className='text-lg'>{ICONS[task?.priority]}</span>
                    <span className='uppercase'>{PRIORITY_TRANSLATION[task?.priority] || task?.priority} Prioridade</span>
                  </div>

                  <div className={clsx("flex items-center gap-2")}>
                    <TaskColor className={TASK_TYPE[task?.stage]} />
                    <span className='text-black uppercase'> {STATUS_TRANSLATION[task?.stage] || task?.stage}</span>
                  </div>
                </div>

                <p className='text-gray-500'>
                  Criado em: {task?.date ? moment(task.date).format("DD/MM/YYYY") : "-"}
                </p>

                <div className='flex items-center gap-8 p-4 border-y border-gray-200'>
                  <div className='space-x-2'>
                    <span className='font-semibold'>Arquivos :</span>
                    <span>{task?.assets?.length}</span>
                  </div>
                  <span className='text-gray-400'>|</span>
                  <div className='space-x-2'>
                    <span className='font-semibold'>Subtarefa :</span>
                    <span>{task?.subTasks?.length}</span>
                  </div>
                </div>

                <div className='space-y-4 py-6'>
                  <p className='text-gray-500 font-semibold text-sm'>
                    TIME
                  </p>
                  <div className='space-y-3'>
                    {task?.team?.map((m, index) => (
                      <div
                        key={index + m?._id}
                        className='flex gap-4 py-2 items-center border-t border-gray-200'
                      >
                        <div
                          className={
                            "w-10 h-10 rounded-full text-white flex items-center justify-center text-sm -mr-1 bg-black"
                          }
                        >
                          <span className='text-center'>
                            {getInitials(m?.name)}
                          </span>
                        </div>
                        <div>
                          <p className='text-lg font-semibold'>{m?.name}</p>
                          <span className='text-gray-500'>{m?.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {task?.subTasks?.length > 0 && (
                  <div className='space-y-4 py-6'>
                    <div className='flex items-center gap-5'>
                      <p className='text-gray-500 font-semibold text-sm'>
                        SUBTAREFAS
                      </p>
                      <div
                        className={`w-fit h-8 px-2 rounded-full flex items-center justify-center text-white ${
                          percentageCompleted < 50
                            ? "bg-rose-400"
                            : percentageCompleted < 80
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        }`}
                      >
                        <p>{percentageCompleted.toFixed(2)}%</p>
                      </div>
                    </div>
                    <div className='space-y-8'>
                      {task?.subTasks?.map((el, index) => (
                        <div key={index + el?._id} className='flex gap-3'>
                          <div className='w-10 h-10 flex items-center justify-center rounded-full bg-violet-200'>
                            <MdTaskAlt className='text-violet-400' size={26} />
                          </div>

                          <div className='space-y-1'>
                            <div className='flex gap-2 items-center'>
                              <span className='text-sm text-gray-500'>
                                Criado em: {el?.date ? moment(el.date).format("DD/MM/YYYY") : "-"}
                              </span>

                              <span className='px-2 py-0.5 text-center text-sm rounded-full bg-violet-100 text-violet-400 font-semibold lowercase'>
                                {el?.tag}
                              </span>

                              <span
                                className={`px-2 py-0.5 text-center text-sm rounded-full font-semibold ${
                                  el?.isCompleted
                                    ? "bg-emerald-100 text-emerald-400"
                                    : "bg-amber-50 text-amber-400"
                                }`}
                              >
                                {el?.isCompleted ? "feito" : "em progresso"}
                              </span>
                            </div>
                            <p className='text-gray-700 pb-2'>{el?.title}</p>

                            <>
                              <button
                                disabled={isSubmitting}
                                className={`text-sm outline-none bg-gray-100 text-gray-800 p-1 rounded ${
                                  el?.isCompleted
                                    ? "hover:bg-rose-100 hover:text-rose-400"
                                    : "hover:bg-emerald-100 hover:text-emerald-400"
                                } disabled:cursor-not-allowed`}
                                onClick={() =>
                                  handleSubmitAction({
                                    status: el?.isCompleted,
                                    id: task?._id,
                                    subId: el?._id,
                                  })
                                }
                              >
                                {isSubmitting ? (
                                  <FaSpinner className='animate-spin' />
                                ) : el?.isCompleted ? (
                                  " Marcar como não feita "
                                ) : (
                                  " Marcar como feita "
                                )}
                              </button>
                            </>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className='w-full md:w-1/2 space-y-3'>
                {task?.description && (
                  <div className='mb-10'>
                    <p className='text-lg font-semibold'>DESCRIÇÃO DA TAREFA</p>
                    <div className='w-full'>{task?.description}</div>
                  </div>
                )}

                {task?.assets?.length > 0 && (
                  <div className='pb-10'>
                    <p className='text-lg font-semibold'>ARQUIVOS</p>
                    <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {task?.assets?.map((el, index) => (
                        <img
                          key={index}
                          src={el}
                          alt={index}
                          className='w-full rounded h-auto md:h-44 2xl:h-52 cursor-pointer transition-all duration-700 md:hover:scale-125 hover:z-50'
                        />
                      ))}
                    </div>
                  </div>
                )}

                {task?.links?.length > 0 && (
                  <div className=''>
                    <p className='text-lg font-semibold'>LINKS</p>
                    <div className='w-full flex flex-col gap-4'>
                      {task?.links?.map((el, index) => (
                        <a
                          key={index}
                          href={el}
                          target='_blank'
                          className='text-blue-400 hover:underline'
                        >
                          {el}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <Activities activity={task?.activities} refetch={refetch} id={id} />
          </>
        )}
      </Tabs>
    </div>
  );
};

export default TaskDetail;
