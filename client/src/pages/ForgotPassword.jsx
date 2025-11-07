import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor, insira seu e-mail.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        "http://localhost:8800/api/user/forgot-password",
        { email }
      );

      if (data.status) {
        toast.success("E-mail de redefinição enviado!");
        setEmail("");
      } else {
        toast.error(data.message || "Erro ao enviar o e-mail.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro no servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-semibold text-center mb-4">
          Esqueceu sua senha?
        </h1>
        <p className="text-gray-600 text-sm text-center mb-6">
          Digite seu e-mail e enviaremos um link para redefinir sua senha.
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu e-mail"
          className="w-full p-2 border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-400 text-white py-2 rounded-lg hover:bg-blue-300 transition disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
