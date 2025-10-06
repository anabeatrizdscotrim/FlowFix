import clsx from "clsx";
import React, { useState, useMemo } from "react";
import {
  MdDelete,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineRestore,
} from "react-icons/md";
import { toast } from "sonner";
import {
  AddUser,
  Button,
  ConfirmatioDialog,
  Loading,
  Title,
} from "../components";
import { TaskColor } from "../components/tasks";
import {
  useDeleteRestoreTastMutation,
  useGetAllTaskQuery,
} from "../redux/slices/api/taskApiSlice";
import { PRIOTITYSTYELS, TASK_TYPE } from "../utils/index";
import { useSearchParams } from "react-router-dom";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const PRIORITY_LABELS = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
  normal: "Normal",
};

const STATUS_LABELS = {
  todo: "Para fazer",
  "in progress": "Em progresso",
  completed: "Finalizado",
};

const Trash = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState(null);
  const [type, setType] = useState("delete");
  const [selected, setSelected] = useState("");
  const [searchParams] = useSearchParams();
  const [searchTerm] = useState(searchParams.get("search") || "");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); 

  const { data, isLoading, refetch } = useGetAllTaskQuery({
    strQuery: "",
    isTrashed: "true",
    search: searchTerm,
  });
  const [deleteRestoreTask] = useDeleteRestoreTastMutation();

  const tasks = data?.tasks;
  
  const totalPages = Math.ceil((tasks?.length || 0) / rowsPerPage);

  const paginatedTasks = useMemo(() => {
    const totalRows = tasks?.length || 0;
    
    const calculatedTotalPages = Math.ceil(totalRows / rowsPerPage);
    const page = Math.min(currentPage, calculatedTotalPages || 1); 

    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return tasks?.slice(startIndex, endIndex) || [];
  }, [tasks, currentPage, rowsPerPage]);
  
  const deleteAllClick = () => {
    setType("deleteAll");
    setMsg("Você quer deletar todas as tarefas?");
    setOpenDialog(true);
  };

  const restoreAllClick = () => {
    setType("restoreAll");
    setMsg("Você quer restaurar todas tarefas?");
    setOpenDialog(true);
  };

  const deleteClick = (id) => {
    setType("delete");
    setSelected(id);
    setOpenDialog(true);
  };

  const restoreClick = (id) => {
    setSelected(id);
    setType("restore");
    setMsg("Você quer restaurar a tarefa selecionada?");
    setOpenDialog(true);
  };

  const deleteRestoreHandler = async () => {
    try {
      let res = null;

      switch (type) {
        case "delete":
          res = await deleteRestoreTask({
            id: selected,
            actionType: "delete",
          }).unwrap();
          break;
        case "deleteAll":
          res = await deleteRestoreTask({
            id: "",
            actionType: "deleteAll",
          }).unwrap();
          break;
        case "restore":
          res = await deleteRestoreTask({
            id: selected,
            actionType: "restore",
          }).unwrap();
          break;
        case "restoreAll":
          res = await deleteRestoreTask({
            id: "",
            actionType: "restoreAll",
          }).unwrap();
          break;
      }

      toast.success(res?.message);

      setTimeout(() => {
        setOpenDialog(false);
        refetch();
      }, 500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const TableHeader = () => (
    <thead className='border-b border-gray-300 dark:border-gray-600'>
      <tr className='text-black dark:text-white  text-left'>
        <th className='py-2'>Título da Tarefa</th>
        <th className='py-2'>Prioridade</th>
        <th className='py-2'>Status</th>
        <th className='py-2 line-clamp-1'>Modificado em</th>
        <th className='py-2 w-[100px] text-right pr-4'>Ações</th>
      </tr>
    </thead>
  );

  const TableRow = ({ item }) => (
    <tr className='border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-400/10'>
      <td className='py-2'>
        <div className='flex items-center gap-2'>
          <TaskColor className={TASK_TYPE[item.stage]} />
          <p className='w-full line-clamp-2 text-base text-black dark:text-gray-400'>
            {item?.title}
          </p>
        </div>
      </td>

      <td className='py-2 capitalize'>
        <div className={"flex gap-1 items-center"}>
          <span className={clsx("text-lg", PRIOTITYSTYELS[item?.priority])}>
            {ICONS[item?.priority]}
          </span>
          <span className=''>{PRIORITY_LABELS[item?.priority] || item?.priority}</span>
        </div>
      </td>

      <td className='py-2 capitalize text-center md:text-start'>
        {STATUS_LABELS[item?.stage] || item?.stage}
      </td>

      <td className='py-2 text-sm'>{new Date(item?.date).toLocaleDateString("pt-BR")}</td>

      <td className='py-2 flex gap-1 justify-end'>
        <Button
          icon={<MdOutlineRestore className='text-xl text-gray-500' />}
          onClick={() => restoreClick(item._id)}
        />
        <Button
          icon={<MdDelete className='text-xl text-red-400' />}
          onClick={() => deleteClick(item._id)}
        />
      </td>
    </tr>
  );

  const PaginationFooter = () => (
    <div className='flex justify-between items-center mt-2 pt-2 text-sm'>
        
        <span className='text-gray-600 dark:text-gray-400'>
            Mostrando {Math.min((currentPage - 1) * rowsPerPage + 1, tasks?.length || 0)} a {Math.min(currentPage * rowsPerPage, tasks?.length || 0)} de {tasks?.length || 0} tarefas
        </span>

        <div className='flex gap-2 items-center'>
            <span className='text-gray-600 dark:text-gray-400'>Página {currentPage} de {totalPages}</span>
            
            <Button
                label={'Anterior'}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || totalPages === 0}
                className='px-3 py-1 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition'
            />
            
            <Button
                label={'Próxima'}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className='px-3 py-1 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition'
            />
        </div>
    </div>
  );

  return isLoading ? (
    <div className='py-10'>
      <Loading />
    </div>
  ) : (
    <>
      <div className='w-full md:px-1 px-0 mb-6'>
        <div className='flex items-center justify-between mb-8'>
          <Title title='Tarefas Excluídas' />

          {data?.tasks?.length > 0 && (
            <div className='flex gap-2 md:gap-4 items-center'>
              <Button
                label='Restaurar tudo'
                icon={<MdOutlineRestore className='text-lg hidden md:flex' />}
                className='flex flex-row-reverse gap-1 items-center  text-black text-sm md:text-base rounded-md 2xl:py-2.5'
                onClick={() => restoreAllClick()}
              />
              <Button
                label='Deletar tudo'
                icon={<MdDelete className='text-lg hidden md:flex' />}
                className='flex flex-row-reverse gap-1 items-center  text-red-400 text-sm md:text-base rounded-md 2xl:py-2.5'
                onClick={() => deleteAllClick()}
              />
            </div>
          )}
        </div>
        {data?.tasks?.length > 0 ? (
          <div className='bg-white dark:bg-[#1f1f1f] px-2 md:px-6 py-4 shadow-md rounded'>
            <div className='overflow-x-auto'>
              <table className='w-full mb-5'>
                <TableHeader />
                <tbody>
                  {paginatedTasks.map((tk) => (
                    <TableRow key={tk._id} item={tk} />
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationFooter />
          </div>
        ) : (
          <div className='w-full flex justify-center py-10'>
            <p className='text-lg text-gray-500'>Não há tarefas excluídas</p>
          </div>
        )}
      </div>

      <AddUser open={open} setOpen={setOpen} />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        msg={msg}
        setMsg={setMsg}
        type={type}
        setType={setType}
        onClick={() => deleteRestoreHandler()}
      />
    </>
  );
};

export default Trash;