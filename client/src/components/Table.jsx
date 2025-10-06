import clsx from "clsx";
import { useState, useMemo } from "react";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { toast } from "sonner";
import { useTrashTastMutation } from "../redux/slices/api/taskApiSlice.js";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, formatDate } from "../utils/index.js";

import { Button, ConfirmatioDialog, UserInfo } from "./index";
import { AddTask, TaskAssets, TaskColor } from "./tasks";
import { Link } from "react-router-dom";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const PRIORITY_TRANSLATION = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  normal: "Normal"
};


const Table = ({ tasks }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5); 

  const [deleteTask] = useTrashTastMutation();

  const deleteClicks = (id) => {
    setSelected(id);
    setOpenDialog(true);
  };

  const editClickHandler = (el) => {
    setSelected(el);
    setOpenEdit(true);
  };

  const deleteHandler = async () => {
    try {
      const res = await deleteTask({
        id: selected,
        isTrashed: "trash",
      }).unwrap();

      toast.success(res?.message);

      setTimeout(() => {
        setOpenDialog(false);
      }, 500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const paginatedTasks = useMemo(() => {
    const totalRows = tasks?.length || 0;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const page = Math.min(currentPage, totalPages || 1); 

    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return tasks?.slice(startIndex, endIndex) || [];
  }, [tasks, currentPage, rowsPerPage]);

  const totalPages = Math.ceil((tasks?.length || 0) / rowsPerPage);

  const TableHeader = () => (
    <thead className='w-full border-b border-gray-300 dark:border-gray-600'>
      <tr className='w-full text-black dark:text-white  text-left'>
        <th className='py-2'>Título</th>
        <th className='py-2'>Prioridade</th>
        <th className='py-2 line-clamp-1'>Criado em</th>
        <th className='py-2'>Detalhes</th>
        <th className='py-2'>Time</th>
        <th className='py-2 w-[100px] text-right pr-4'>Ações</th> 
      </tr>
    </thead>
  );

  const TableRow = ({ task }) => (
    <tr className='border-b border-gray-200 text-gray-600 hover:bg-gray-300/10'>
      <td className='py-2'>
        <Link to={`/task/${task._id}`}>
          <div className='flex items-center gap-2'>
            <TaskColor className={TASK_TYPE[task.stage]} />
            <p className='w-full line-clamp-2 text-base text-black dark:text-gray-200'>
              {task?.title}
            </p>
          </div>
        </Link>
      </td>

      <td className='py-2'>
        <div className={"flex gap-1 items-center"}>
          <span className={clsx("text-lg", PRIOTITYSTYELS[task?.priority])}>
            {ICONS[task?.priority]}
          </span>
          <span className='capitalize line-clamp-1'>
            {PRIORITY_TRANSLATION[task?.priority] || task?.priority} Prioridade
          </span>
        </div>
      </td>

      <td className='py-2'>
        <span className='text-sm text-gray-600 dark:text-gray-400'>
          {formatDate(new Date(task?.date))}
        </span>
      </td>

      <td className='py-2'>
        <TaskAssets
          activities={task?.activities?.length}
          subTasks={task?.subTasks}
          assets={task?.assets?.length}
        />
      </td>

      <td className='py-2'>
        <div className='flex'>
          {task?.team?.map((m, index) => (
            <div
              key={m._id}
              className={clsx(
                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                BGS[index % BGS?.length]
              )}
            >
              <UserInfo user={m} />
            </div>
          ))}
        </div>
      </td>

      <td className='py-2 flex gap-2 md:gap-4 justify-end'>
        <Button
          className='text-blue-400 hover:text-blue-300 sm:px-0 text-sm md:text-base'
          label='Editar'
          type='button'
          onClick={() => editClickHandler(task)}
        />

        <Button
          className='text-red-400 hover:text-red-300 sm:px-0 text-sm md:text-base'
          label='Deletar'
          type='button'
          onClick={() => deleteClicks(task._id)}
        />
      </td>
    </tr>
  );
  
  const PaginationFooter = () => (
    <div className='flex justify-between items-center mt-2 dark:border-gray-700 pt-2 text-sm'>
        
        <span className='text-gray-600 dark:text-gray-400'>
            Mostrando {Math.min((currentPage - 1) * rowsPerPage + 1, tasks?.length || 0)} a {Math.min(currentPage * rowsPerPage, tasks?.length || 0)} de {tasks?.length || 0} tarefas
        </span>

        <div className='flex gap-2 items-center'>
            <span className='text-gray-600 dark:text-gray-400'>Página {currentPage} de {totalPages}</span>
            
            <Button
                label={'Anterior'}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || totalPages === 0}
                className='px-3 py-1 text-sm bg-black text-white dark:bg-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 transition'
            />
            
            <Button
                label={'Próxima'}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className='px-3 py-1 text-sm bg-black text-white dark:bg-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 transition'
            />
        </div>
    </div>
  );

  return (
    <>
      <div className='bg-white dark:bg-[#1f1f1f] px-2 md:px-4 pt-4 pb-9 shadow-md rounded'>
        <div className='overflow-x-auto'>
          <table className='w-full '>
            <TableHeader />
            <tbody>
              {paginatedTasks.map((task, index) => (
                <TableRow key={task._id || index} task={task} />
              ))}
            </tbody>
          </table>
        </div>
        
        {tasks?.length > 0 && <PaginationFooter />}
        
      </div>

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />

      {openEdit && selected && (
        <AddTask
          open={openEdit}
          setOpen={setOpenEdit}
          task={selected}
          key={selected._id}
        />
      )}
    </>
  );
};

export default Table;