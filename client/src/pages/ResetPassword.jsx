import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }

    try {
      await axios.put(`http://localhost:8800/api/user/reset-password/${token}`, { password });
      toast.success("Senha redefinida com sucesso!");
      navigate("/log-in");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Erro ao redefinir senha");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">Redefinir Senha</h2>

        <input
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="password"
          placeholder="Confirmar senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-400 text-white py-2 rounded-md hover:bg-blue-300"
        >
          Confirmar
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
