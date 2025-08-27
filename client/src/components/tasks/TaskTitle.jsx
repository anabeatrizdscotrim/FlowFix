import TaskColor from "./TaskColor";

const TaskTitle = ({ label, className, cardClass }) => {
  return (
    <div className={`w-full h-10 md:h-12 px-2 md:px-4 rounded flex items-center justify-between ${cardClass}`}>
      <div className='flex gap-2 items-center'>
        <TaskColor className={className} />
        <p className='text-sm md:text-base text-gray-700 dark:text-gray-300'>
          {label}
        </p>
      </div>
    </div>
  );
};

export default TaskTitle;
