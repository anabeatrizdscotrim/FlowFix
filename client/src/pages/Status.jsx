import React from "react";
import { useGetUserTaskStatusQuery } from "../redux/slices/api/userApiSlice";
import { countTasksByStage, getInitials } from "../utils";
import { Loading, Title } from "../components";

const StatusPage = () => {
  const { data, isLoading } = useGetUserTaskStatusQuery();

  if (isLoading) {
    return (
      <div className="py-10">
        <Loading />
      </div>
    );
  }

  const UserCard = ({ user }) => {
    const counts = countTasksByStage(user?.tasks);
    const totalTasks = user?.tasks?.length || 0;

    const calculatePercentage = (count) => {
      if (totalTasks === 0) return 0;
      return Math.min((count / totalTasks) * 100, 100);
    };

    const progress = [
      { label: "Em Progresso", count: counts.inProgress, color: "bg-yellow-500" },
      { label: "A Fazer", count: counts.todo, color: "bg-blue-500" },
      { label: "Concluído", count: counts.completed, color: "bg-green-500" },
    ];

    return (
      <div className="bg-white dark:bg-[#1f1f1f] shadow-md rounded-xl p-5 hover:shadow-lg transition">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold">
            {getInitials(user.name)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {user.name}
            </h2>
            <p className="text-sm text-gray-500">{user.title}</p>
          </div>
        </div>

        <div className="space-y-2">
          {progress.map((item, index) => {
            const percentage = calculatePercentage(item.count);

            return (
              <div key={index}>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>{item.label}</span>

                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between mt-4 text-sm text-gray-700 dark:text-gray-200">
          <span>Total: {totalTasks}</span>
          <div className="flex gap-2">
            <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-600 text-xs">
              {counts.inProgress}
            </span>
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-600 text-xs">
              {counts.todo}
            </span>
            <span className="px-2 py-1 rounded bg-green-100 text-green-600 text-xs">
              {counts.completed}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full md:px-1 px-0 mb-6">
      <div className="flex items-center justify-between mb-8">
        <Title title="Status das Tarefas" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((user, index) => (
          <UserCard key={index} user={user} />
        ))}
      </div>
    </div>
  );
};

export default StatusPage;