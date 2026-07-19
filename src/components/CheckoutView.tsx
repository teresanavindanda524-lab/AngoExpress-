/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  CheckCircle, 
  Copy, 
  FileText, 
  Send, 
  Upload, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Calendar
} from "lucide-react";
import { Order } from "../types";
import { formatKz } from "../data";

interface CheckoutViewProps {
  order: Order;
  bankDetails: {
    iban: string;
    accountNumber?: string;
    beneficiary: string;
    phone: string;
    email: string;
  };
  onReceiptSubmitted: (orderId: string, reference: string, fileAttached: boolean) => void;
  onTrackOrder: (phone: string) => void;
}

export default function CheckoutView({
  order,
  bankDetails,
  onReceiptSubmitted,
  onTrackOrder
}: CheckoutViewProps) {
  const [txReference, setTxReference] = useState("");
  const [isReceiptUploaded, setIsReceiptUploaded] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const handleSubmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txReference.trim() && !isReceiptUploaded) {
      alert("Por favor, introduza a referência do pagamento ou anexe o comprovativo.");
      return;
    }
    
    onReceiptSubmitted(order.id, txReference.trim() || `COMPROVATIVO-ANEXADO-${Date.now()}`, isReceiptUploaded);
    setSuccessMsg("Comprovativo de pagamento submetido com sucesso! O administrador irá analisar nas próximas horas.");
  };

  const getPaymentInstructions = () => {
    switch (order.paymentMethod) {
      case "multicaixa_express":
        return {
          title: "Instruções Multicaixa Express",
          steps: [
            "Abra o aplicativo Multicaixa Express no seu telemóvel.",
            "Selecione 'Transferências' ou 'Pagamentos por Referência'.",
            `Transfira o valor exato de ${formatKz(order.totalKz)} para o IBAN fornecido abaixo.`,
            "Guarde o comprovativo digital gerado em formato PDF (Obrigatório).",
            "Anexe o PDF e insira o número de transação ou referência no formulário."
          ]
        };
      case "unitel_money":
        return {
          title: "Instruções Unitel Money",
          steps: [
            "Aceda ao menu Unitel Money no seu telemóvel discando *112# ou pela App.",
            "Selecione 'Enviar Dinheiro' para um número de telefone ou agente.",
            `Insira o número de telefone da administração: ${bankDetails.phone}.`,
            `Envie o montante exato de ${formatKz(order.totalKz)}.`,
            "Aguarde o SMS de confirmação da Unitel.",
            "Tire um screenshot do SMS ou aplicativo e guarde em formato PNG (Obrigatório).",
            "Insira o número de transação constante do SMS e carregue o ficheiro PNG no formulário."
          ]
        };
      case "paypay_angola":
        return {
          title: "Instruções PayPay Angola",
          steps: [
            "Abra a App PayPay Angola no seu telemóvel.",
            "Escolha a opção 'Transferir' ou 'Pagar'.",
            `Efetue o pagamento de ${formatKz(order.totalKz)} para o número PayPay: ${bankDetails.phone}.`,
            "Escreva o código do pedido '" + order.id + "' na mensagem opcional da transferência.",
            "Guarde o comprovativo oficial gerado em formato PDF (Obrigatório).",
            "Submeta o arquivo PDF e o número de transação no formulário."
          ]
        };
      case "agent_bai":
        return {
          title: "Instruções Depósito Agente BAI",
          steps: [
            "Desloque-se a um Agente Autorizado BAI ou balcão bancário mais próximo.",
            "Solicite a realização de um depósito físico para a conta Ango Express.",
            `Deposite o valor exato de ${formatKz(order.totalKz)} para a Conta Depósito BAI: ${bankDetails.accountNumber || "3011252481890"}.`,
            "O agente BAI emitirá um talão de depósito impresso em papel.",
            "Tire uma fotografia nítida (JPEG/PNG) do talão em papel (Obrigatório).",
            "Anexe a fotografia no formulário abaixo."
          ]
        };
      case "atm_transfer":
      default:
        return {
          title: "Instruções de Transferência ATM",
          steps: [
            "Desloque-se a um Caixa Automático (ATM) Multicaixa.",
            "Introduza o seu cartão e selecione 'Transferências'.",
            `Insira o IBAN da Ango Express fornecido abaixo.`,
            `Transfira o valor de ${formatKz(order.totalKz)}.`,
            "Guarde o talão físico impresso emitido pelo ATM.",
            "Tire uma fotografia nítida (JPEG/PNG) do talão em papel (Obrigatório).",
            "Anexe a fotografia no formulário abaixo."
          ]
        };
    }
  };

  const getRequiredFormatInfo = () => {
    switch (order.paymentMethod) {
      case "multicaixa_express":
      case "paypay_angola":
        return {
          label: "Carregar comprovativo oficial em PDF",
          hint: "Formatos recomendados: PDF (Exigido pelo operador)"
        };
      case "unitel_money":
        return {
          label: "Carregar captura de ecrã em PNG",
          hint: "Formatos recomendados: PNG ou screenshot (Exigido)"
        };
      case "agent_bai":
        return {
          label: "Tirar e carregar fotografia do talão físico",
          hint: "Formatos recomendados: Foto em PNG ou JPG do talão BAI Agent"
        };
      case "atm_transfer":
      default:
        return {
          label: "Tirar e carregar fotografia do talão físico",
          hint: "Formatos recomendados: Foto em PNG ou JPG do talão físico do ATM"
        };
    }
  };

  const instructions = getPaymentInstructions();
  const formatInfo = getRequiredFormatInfo();

  return (
    <div className="space-y-8 py-4 animate-fade-in" id="checkout-view-container">
      
      {/* Top success visual */}
      <div className="bg-green-500/10 dark:bg-green-500/5 border border-green-500/10 p-6 sm:p-8 rounded-2xl text-center space-y-3" id="order-success-banner">
        <CheckCircle className="h-14 w-14 text-green-600 mx-auto animate-pulse" />
        <div className="space-y-1">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-green-800 dark:text-green-400">
            Pedido Registado com Sucesso!
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            A sua encomenda foi registada no nosso sistema sob o código exclusivo <strong>{order.id}</strong>.
          </p>
        </div>
        <div className="inline-flex gap-4 p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-green-500/10 text-xs">
          <div className="text-left font-mono">
            <span className="text-gray-400 block uppercase text-[9px]">Código Interno</span>
            <strong className="text-gray-800 dark:text-gray-200">{order.id}</strong>
          </div>
          <div className="w-[1px] bg-gray-200 dark:bg-zinc-800" />
          <div className="text-left font-mono">
            <span className="text-gray-400 block uppercase text-[9px]">Valor Total</span>
            <strong className="text-red-600 font-bold">{formatKz(order.totalKz)}</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* LEFT COLUMN: Payment Coordinates & Instructions */}
        <div className="lg:col-span-7 space-y-6" id="payment-coords-panel">
          
          <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-black dark:text-white pb-3 border-b border-gray-100 dark:border-zinc-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-600" />
              <span>{instructions.title}</span>
            </h3>
            
            <ul className="space-y-2.5 text-xs text-gray-600 dark:text-gray-400 pl-4 list-decimal marker:text-red-600">
              {instructions.steps.map((step, idx) => (
                <li key={idx} className="leading-relaxed">{step}</li>
              ))}
            </ul>
          </div>

          {/* Core Bank Details Box */}
          <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dados Bancários para Pagamento</h3>
            
            <div className="space-y-3.5">
              {/* IBAN */}
              <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-gray-400 font-mono uppercase">IBAN (Banco BAI)</span>
                  <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200 block truncate">{bankDetails.iban}</span>
                </div>
                <button
                  onClick={() => handleCopy(bankDetails.iban, "iban")}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg text-gray-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold">{copyFeedback === "iban" ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>

              {/* Beneficiary */}
              <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-gray-400 font-mono uppercase">Beneficiário da Conta</span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 block">{bankDetails.beneficiary}</span>
                </div>
                <button
                  onClick={() => handleCopy(bankDetails.beneficiary, "beneficiário")}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg text-gray-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold">{copyFeedback === "beneficiário" ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>

              {/* Contact phone */}
              <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-gray-400 font-mono uppercase">Telemóvel (Unitel Money / PayPay)</span>
                  <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200 block">{bankDetails.phone}</span>
                </div>
                <button
                  onClick={() => handleCopy(bankDetails.phone, "telefone")}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg text-gray-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold">{copyFeedback === "telefone" ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 dark:bg-amber-500/5 rounded-xl border border-amber-500/10 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <p className="leading-normal">
                <strong>Importante:</strong> Certifique-se de efetuar a transferência no valor exato de <strong>{formatKz(order.totalKz)}</strong> para agilizar a verificação de segurança automática e manual.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Receipt Upload & Support */}
        <div className="lg:col-span-5 space-y-6" id="upload-receipt-panel">
          
          {/* Submit Receipt Form */}
          <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-black dark:text-white flex items-center gap-2">
              <Send className="h-5 w-5 text-red-600" />
              <span>Submeter Comprovativo</span>
            </h3>
            
            {successMsg ? (
              <div className="bg-green-500/10 dark:bg-green-500/5 border border-green-500/10 p-4 rounded-xl text-xs text-green-700 dark:text-green-400 text-center space-y-3">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                <p>{successMsg}</p>
                <button
                  onClick={() => onTrackOrder(order.customer.phone)}
                  className="bg-green-600 text-white font-semibold text-xs px-4 py-2 rounded-lg hover:bg-green-700 w-full"
                >
                  Acompanhar Encomenda na Área do Cliente
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReceipt} className="space-y-4">
                
                {/* File Upload drag area */}
                <div 
                  onClick={() => setIsReceiptUploaded(!isReceiptUploaded)}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isReceiptUploaded 
                      ? "border-green-500 bg-green-500/5" 
                      : "border-gray-300 dark:border-zinc-800 hover:border-red-600"
                  }`}
                >
                  <Upload className={`h-8 w-8 mx-auto mb-2 ${isReceiptUploaded ? "text-green-600 animate-bounce" : "text-gray-400"}`} />
                  <span className="text-xs font-semibold block text-gray-700 dark:text-gray-300">
                    {isReceiptUploaded ? "Comprovativo Selecionado com Sucesso! ✅" : formatInfo.label}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-1">{formatInfo.hint} (Máx. 5MB)</span>
                </div>

                {/* Text input for reference number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                    <span>Nº da Transação ou Referência</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Ref 202612948-AO ou Nº Talão"
                    value={txReference}
                    onChange={(e) => setTxReference(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                  <span className="text-[9px] text-gray-400 block">Caso o upload falhe, digite aqui o número de transação emitido pelo banco.</span>
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-black dark:bg-zinc-900 text-white hover:bg-zinc-900 dark:hover:bg-zinc-800 text-xs font-bold rounded-xl shadow transition-all active:scale-98"
                >
                  Confirmar Pagamento e Enviar
                </button>

              </form>
            )}
          </div>

          {/* Quick Tracking & Whatsapp box */}
          <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Apoio e Suporte ao Pedido</h3>
            
            <div className="flex items-start gap-3 text-xs text-gray-600 dark:text-gray-400">
              <PhoneCall className="h-5 w-5 text-red-600 shrink-0" />
              <div className="space-y-1">
                <span className="font-bold text-black dark:text-white block">Precisa de Ajuda?</span>
                <p className="leading-relaxed">Envie o talão diretamente para o nosso suporte oficial via WhatsApp para confirmação acelerada:</p>
                <a 
                  href={`https://wa.me/${bankDetails.phone.replace(/\s+/g, "").replace("+", "")}?text=Olá,%20submeti%20o%20meu%20pedido%20${order.id}%20na%20AngoExpress%20e%20gostaria%20de%20enviar%20o%20comprovativo.`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-green-600 hover:underline font-semibold mt-1"
                >
                  <span>Enviar por WhatsApp (+244)</span>
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>

            <button
              onClick={() => onTrackOrder(order.customer.phone)}
              className="w-full py-3 border border-gray-300 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:text-red-600 hover:border-red-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <span>Ir para Área do Cliente</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
