// src/components/RelatorioDiarioForm.jsx
import React, { useState, useEffect } from 'react';
import djangoApi from '../../api/djangoApi';

function RelatorioDiarioForm({
  onSave,
  onCancel,
  existingRelatorio = null,
  currentUserLojaId = null,
}) {
  const [lojas, setLojas] = useState([]);
  const [categoriasEstoque, setCategoriasEstoque] = useState([]);
  const [itensEstoquePorCategoria, setItensEstoquePorCategoria] = useState({});
  const [formData, setFormData] = useState({
    loja: '',
    pedidos_porta: 0,
    pedidos_entrega: 0,
    faturamento: 0,
    erros_detalhes: '',
    motoboys: [{ nome_motoboy: '', quantidade_entregas: 0, valor_entregas: 0 }],
    nao_conformidades: [{ item_nao_conforme: '', quantidade: 0 }],
    estoques: {},
    cancelamentos: [
      // 👈 Novo campo inicializado como array
      {
        motivo_cancelamento: '',
        tipo_cancelamento: '', // loja ou cliente
        gerou_prejuizo: false,
        valor_prejuizo: 0,
        acao_tomada: '',
      },
    ],
    status: 'rascunho',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lojasResponse = await djangoApi.get('/lojas/');
        setLojas(lojasResponse.data);

        const categoriasResponse = await djangoApi.get('/categorias-estoque/');
        setCategoriasEstoque(categoriasResponse.data);

        const itensResponse = await djangoApi.get('/itens-estoque/');
        const organizado = {};
        categoriasResponse.data.forEach((cat) => {
          organizado[cat.nome] = itensResponse.data.filter(
            (item) => item.categoria === cat.id,
          );
        });
        setItensEstoquePorCategoria(organizado);

        if (existingRelatorio) {
          const detalhesResponse = await djangoApi.get(
            `/relatorios-diarios/${existingRelatorio.id}/`,
          );
          const detalhes = detalhesResponse.data;

          const estoquesPrePop = {};
          detalhes.estoques.forEach((estoque) => {
            estoquesPrePop[estoque.item_estoque] = {
              quantidade: estoque.quantidade,
              esta_acabando: estoque.esta_acabando,
            };
          });

          setFormData({
            loja: detalhes.loja,
            pedidos_porta: detalhes.pedidos_porta,
            pedidos_entrega: detalhes.pedidos_entrega,
            faturamento: detalhes.faturamento || 0,
            erros_detalhes: detalhes.erros_detalhes,
            motoboys:
              detalhes.motoboys.length > 0
                ? detalhes.motoboys
                : [
                    {
                      nome_motoboy: '',
                      quantidade_entregas: 0,
                      valor_entregas: 0,
                    },
                  ],
            nao_conformidades:
              detalhes.nao_conformidades.length > 0
                ? detalhes.nao_conformidades
                : [{ item_nao_conforme: '', quantidade: 0 }],
            cancelamentos:
              detalhes.cancelamentos?.length > 0
                ? detalhes.cancelamentos
                : [
                    {
                      motivo_cancelamento: '',
                      tipo_cancelamento: '',
                      gerou_prejuizo: false,
                      valor_prejuizo: 0,
                      acao_tomada: '',
                    },
                  ],
            estoques: estoquesPrePop,
            status: detalhes.status,
          });
        } else if (currentUserLojaId) {
          setFormData((prev) => ({ ...prev, loja: String(currentUserLojaId) }));
        }
      } catch (err) {
        console.error('Erro ao carregar dados do formulário:', err);
        setError('Erro ao carregar dados iniciais do inventário.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [existingRelatorio, currentUserLojaId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (
      name === 'pedidos_porta' ||
      name === 'pedidos_entrega' ||
      name === 'faturamento'
    ) {
      newValue = Number(value);
      if (isNaN(newValue)) newValue = 0;
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  // Motoboys
  const handleMotoboyChange = (index, e) => {
    const { name, value } = e.target;
    const newMotoboys = [...formData.motoboys];
    newMotoboys[index][name] =
      name === 'quantidade_entregas' || name === 'valor_entregas'
        ? Number(value)
        : value;
    setFormData((prev) => ({ ...prev, motoboys: newMotoboys }));
  };
  const addMotoboy = () =>
    setFormData((prev) => ({
      ...prev,
      motoboys: [
        ...prev.motoboys,
        { nome_motoboy: '', quantidade_entregas: 0, valor_entregas: 0 },
      ],
    }));
  const removeMotoboy = (index) => {
    if (formData.motoboys.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      motoboys: prev.motoboys.filter((_, i) => i !== index),
    }));
  };

  // CANCELAMENTOS
  const handleCancelamentoChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const novosCancelamentos = [...prev.cancelamentos];
      novosCancelamentos[index][name] = type === 'checkbox' ? checked : value;
      return { ...prev, cancelamentos: novosCancelamentos };
    });
  };
  const addCancelamento = () => {
    setFormData((prev) => ({
      ...prev,
      cancelamentos: [
        ...prev.cancelamentos,
        {
          motivo_cancelamento: '',
          tipo_cancelamento: '',
          gerou_prejuizo: false,
          valor_prejuizo: 0,
          acao_tomada: '',
        },
      ],
    }));
  };
  const removeCancelamento = (index) => {
    setFormData((prev) => {
      const novos = [...prev.cancelamentos];
      novos.splice(index, 1);
      return { ...prev, cancelamentos: novos };
    });
  };

  // Não Conformidades
  const handleNaoConformidadeChange = (index, e) => {
    const { name, value } = e.target;
    const newNaoConformidades = [...formData.nao_conformidades];
    newNaoConformidades[index][name] =
      name === 'quantidade' ? Number(value) : value;
    setFormData((prev) => ({
      ...prev,
      nao_conformidades: newNaoConformidades,
    }));
  };
  const addNaoConformidade = () =>
    setFormData((prev) => ({
      ...prev,
      nao_conformidades: [
        ...prev.nao_conformidades,
        { item_nao_conforme: '', quantidade: 0 },
      ],
    }));
  const removeNaoConformidade = (index) => {
    if (formData.nao_conformidades.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      nao_conformidades: prev.nao_conformidades.filter((_, i) => i !== index),
    }));
  };

  // Estoques
  const handleEstoqueChange = (itemId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      estoques: {
        ...prev.estoques,
        [itemId]: {
          ...prev.estoques[itemId],
          [field]: field === 'quantidade' ? Number(value) : value,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const totalEntregasMotoboys = formData.motoboys.reduce(
      (sum, moto) => sum + (moto.quantidade_entregas || 0),
      0,
    );
    if (formData.pedidos_entrega !== totalEntregasMotoboys) {
      setError(
        'Erro: O total de Pedidos Entrega deve ser igual à soma das Entregas de todos os Motoboys.',
      );
      return;
    }

    try {
      const estoquesParaAPI = Object.keys(itensEstoquePorCategoria).flatMap(
        (categoriaNome) =>
          itensEstoquePorCategoria[categoriaNome].map((item) => ({
            item_estoque: item.id,
            quantidade: formData.estoques[item.id]?.quantidade || 0,
            esta_acabando: formData.estoques[item.id]?.esta_acabando || false,
          })),
      );

      const filteredMotoboys = formData.motoboys.filter(
        (moto) => moto.nome_motoboy.trim() !== '',
      );
      const filteredNaoConformidades = formData.nao_conformidades.filter(
        (nc) => nc.item_nao_conforme.trim() !== '',
      );

      // Corrige campos dos cancelamentos
      const filteredCancelamentos = formData.cancelamentos
        .filter(
          (c) =>
            c.motivo_cancelamento.trim() !== '' &&
            c.tipo_cancelamento.trim() !== '',
        )
        .map((c) => ({
          ...c,
          // força letras minúsculas para o Django aceitar
          tipo_cancelamento: c.tipo_cancelamento.toLowerCase(),
          // converte 'Sim'/'Não' para boolean
          gerou_prejuizo:
            c.gerou_prejuizo === true ||
            c.gerou_prejuizo === 'Sim' ||
            c.gerou_prejuizo === 'true',
        }));

      const baseData = {
        loja: formData.loja,
        pedidos_porta: formData.pedidos_porta,
        pedidos_entrega: formData.pedidos_entrega,
        faturamento: formData.faturamento,
        erros_detalhes: formData.erros_detalhes,
        motoboys: filteredMotoboys,
        nao_conformidades: filteredNaoConformidades,
        estoques: estoquesParaAPI,
        cancelamentos: filteredCancelamentos,
      };

      let response;
      if (existingRelatorio) {
        response = await djangoApi.put(
          `/relatorios-diarios/${existingRelatorio.id}/`,
          { ...baseData, status: formData.status },
        );
      } else {
        response = await djangoApi.post('/relatorios-diarios/', {
          ...baseData,
          status: 'rascunho',
        });
      }
      onSave(response.data);
    } catch (err) {
      console.error('Erro ao salvar relatório:', err.response?.data || err);
      const serverErrors = err.response?.data;
      let errorMessage =
        'Erro ao salvar relatório. Verifique os campos e tente novamente.';
      if (serverErrors) {
        if (serverErrors.detail) errorMessage = `Erro: ${serverErrors.detail}`;
        else if (serverErrors.non_field_errors)
          errorMessage = `Erro: ${serverErrors.non_field_errors.join(', ')}`;
        else {
          errorMessage = Object.keys(serverErrors)
            .map((field) => {
              const value = serverErrors[field];
              if (Array.isArray(value)) {
                return `${field}: ${value.join(', ')}`;
              } else if (typeof value === 'string') {
                return `${field}: ${value}`;
              } else if (typeof value === 'object') {
                // Caso seja objeto com erros detalhados
                return `${field}: ${Object.values(value).flat().join(', ')}`;
              }
              return `${field}: Erro desconhecido`;
            })
            .join('; ');
        }
      }
      setError(errorMessage);
    }
  };

  if (loading)
    return (
      <div className="p-5 text-center font-sans text-gray-600">
        Carregando formulário...
      </div>
    );

  return (
    <div className="p-5 max-w-5xl mx-auto font-sans">
      <h3 className="text-2xl font-semibold text-[#d20000] mb-6">
        {existingRelatorio
          ? 'Atualizar Inventário'
          : 'Realizar Novo Inventário'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações Gerais */}
        <fieldset className="border border-gray-300 rounded-md p-4">
          <legend className="font-semibold text-[#d20000] px-2">
            Informações Gerais
          </legend>
          <label className="block mt-2">
            <span className="text-gray-700 font-medium">Loja:</span>
            <select
              name="loja"
              value={String(formData.loja)}
              onChange={handleInputChange}
              required
              disabled={!!currentUserLojaId}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white
                py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000]
                disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Selecione uma Loja</option>
              {lojas.map((loja) => (
                <option key={loja.id} value={String(loja.id)}>
                  {loja.nome}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        {/* Pedidos e Faturamento */}
        <fieldset className="border border-gray-300 rounded-md p-4">
          <legend className="font-semibold text-[#d20000] px-2">Pedidos</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-gray-700 font-medium">Porta:</span>
              <input
                type="number"
                name="pedidos_porta"
                value={formData.pedidos_porta}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                  focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000]"
              />
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Entrega:</span>
              <input
                type="number"
                name="pedidos_entrega"
                value={formData.pedidos_entrega}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                  focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000]"
              />
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Faturamento:</span>
              <input
                type="number"
                name="faturamento"
                step="0.01"
                value={formData.faturamento}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                  focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000]"
              />
            </label>
          </div>
        </fieldset>

        {/* Motoboys */}
        <fieldset className="border border-gray-300 rounded-md p-4">
          <legend className="font-semibold text-[#d20000] px-2">
            Motoboys
          </legend>
          <div className="space-y-4">
            {formData.motoboys.map((moto, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-md p-4 shadow-sm bg-white"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="block">
                    <span className="text-gray-700 font-medium">Nome:</span>
                    <input
                      type="text"
                      name="nome_motoboy"
                      value={moto.nome_motoboy}
                      onChange={(e) => handleMotoboyChange(index, e)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                        focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-gray-700 font-medium">Entregas:</span>
                    <input
                      type="number"
                      name="quantidade_entregas"
                      value={moto.quantidade_entregas}
                      onChange={(e) => handleMotoboyChange(index, e)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                        focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-gray-700 font-medium">Valor:</span>
                    <input
                      type="number"
                      step="0.01"
                      name="valor_entregas"
                      value={moto.valor_entregas}
                      onChange={(e) => handleMotoboyChange(index, e)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                        focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000]"
                    />
                  </label>
                </div>
                {formData.motoboys.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMotoboy(index)}
                    className="mt-3 text-red-600 hover:text-red-800 font-semibold"
                  >
                    Remover Motoboy
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addMotoboy}
            className="mt-4 inline-block bg-[#d20000] text-white px-4 py-2 rounded-md hover:bg-[#c70d0d] transition"
          >
            Adicionar Motoboy
          </button>
        </fieldset>

        {/* Registro de Cancelamentos */}
        <fieldset className="border border-gray-300 rounded-md p-4">
          <legend className="font-semibold text-[#d20000] px-2">
            Registro de Cancelamentos
          </legend>
          <div className="space-y-4">
            {formData.cancelamentos.map((cancel, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-md p-4 shadow-sm bg-white"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Motivo do Cancelamento */}
                  <label className="block">
                    <span className="text-gray-700 font-medium">
                      Motivo do Cancelamento:
                    </span>
                    <select
                      name="motivo_cancelamento"
                      value={cancel.motivo_cancelamento}
                      onChange={(e) => handleCancelamentoChange(index, e)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000]"
                    >
                      <option value="">Selecione</option>
                      <option value="Pedido duplicado">Pedido duplicado</option>
                      <option value="Erro no sistema">Erro no sistema</option>
                      <option value="Cliente desistiu">Cliente desistiu</option>
                      <option value="Produto indisponível">
                        Produto indisponível
                      </option>
                      <option value="Produto incorreto">
                        Produto incorreto
                      </option>
                      <option value="Atraso na entrega">
                        Atraso na entrega
                      </option>
                      <option value="Problema de qualidade">
                        Problema de qualidade
                      </option>
                      <option value="Pedido fraudulento">
                        Pedido fraudulento
                      </option>
                      <option value="Erro no cadastro do cliente">
                        Erro no cadastro do cliente
                      </option>
                      <option value="Política interna / ajuste operacional">
                        Política interna / ajuste operacional
                      </option>
                    </select>
                  </label>

                  {/* Cancelamento interno ou do cliente */}
                  <label className="block">
                    <span className="text-gray-700 font-medium">
                      Cancelamento interno ou do cliente?
                    </span>
                    <select
                      name="tipo_cancelamento"
                      value={cancel.tipo_cancelamento}
                      onChange={(e) => handleCancelamentoChange(index, e)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000]"
                    >
                      <option value="">Selecione</option>
                      <option value="Interno">Interno</option>
                      <option value="Cliente">Cliente</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {/* Gerou prejuízo */}
                  <label className="block">
                    <span className="text-gray-700 font-medium">
                      Gerou prejuízo?
                    </span>
                    <select
                      name="gerou_prejuizo"
                      value={cancel.gerou_prejuizo}
                      onChange={(e) => handleCancelamentoChange(index, e)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000]"
                    >
                      <option value="">Selecione</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </label>

                  {/* Valor do prejuízo */}
                  <label className="block">
                    <span className="text-gray-700 font-medium">
                      Valor do Prejuízo:
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      name="valor_prejuizo"
                      value={cancel.valor_prejuizo}
                      onChange={(e) => handleCancelamentoChange(index, e)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000]"
                    />
                  </label>

                  {/* Ação tomada / solução */}
                  <label className="block sm:col-span-3">
                    <span className="text-gray-700 font-medium">
                      Ação tomada / solução:
                    </span>
                    <textarea
                      name="acao_tomada"
                      value={cancel.acao_tomada}
                      onChange={(e) => handleCancelamentoChange(index, e)}
                      rows={2}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000] resize-none"
                    />
                  </label>
                </div>

                {formData.cancelamentos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCancelamento(index)}
                    className="mt-3 text-red-600 hover:text-red-800 font-semibold"
                  >
                    Remover Cancelamento
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addCancelamento}
            className="mt-4 inline-block bg-[#d20000] text-white px-4 py-2 rounded-md hover:bg-[#c70d0d] transition"
          >
            Adicionar Cancelamento
          </button>
        </fieldset>

        {/* Erros */}
        <fieldset className="border border-gray-300 rounded-md p-4">
          <legend className="font-semibold text-[#d20000] px-2">Erros</legend>
          <textarea
            name="erros_detalhes"
            value={formData.erros_detalhes}
            onChange={handleInputChange}
            rows="4"
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 resize-vertical
              focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#c70d0d]"
          ></textarea>
        </fieldset>

        {/* Não Conformidades */}
        <fieldset className="border border-gray-300 rounded-md p-4">
          <legend className="font-semibold text-[#d20000] px-2">
            Não Conformidades
          </legend>
          <div className="space-y-4">
            {formData.nao_conformidades.map((nc, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-md p-4 shadow-sm bg-white"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-gray-700 font-medium">Item:</span>
                    <input
                      type="text"
                      name="item_nao_conforme"
                      value={nc.item_nao_conforme}
                      onChange={(e) => handleNaoConformidadeChange(index, e)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                        focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-gray-700 font-medium">
                      Quantidade:
                    </span>
                    <input
                      type="number"
                      name="quantidade"
                      value={nc.quantidade}
                      onChange={(e) => handleNaoConformidadeChange(index, e)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                        focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000]"
                    />
                  </label>
                </div>
                {formData.nao_conformidades.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeNaoConformidade(index)}
                    className="mt-3 text-red-600 hover:text-red-800 font-semibold"
                  >
                    Remover Não Conformidade
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addNaoConformidade}
            className="mt-4 inline-block bg-[#d20000] text-white px-4 py-2 rounded-md hover:bg-[#c70d0d] transition"
          >
            Adicionar Não Conformidade
          </button>
        </fieldset>

        {/* Estoque */}
        <fieldset className="border border-gray-300 rounded-md p-4">
          <legend className="font-semibold text-[#d20000] px-2">Estoque</legend>
          {categoriasEstoque.map((categoria) => (
            <div key={categoria.id} className="mb-6">
              <h4 className="font-semibold text-[#d20000] mb-3">
                {categoria.nome}
              </h4>
              {itensEstoquePorCategoria[categoria.nome]?.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center mb-3"
                >
                  <label className="col-span-2">
                    <span className="text-gray-700 font-medium">
                      {item.nome}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estoques[item.id]?.quantidade || 0}
                    onChange={(e) =>
                      handleEstoqueChange(item.id, 'quantidade', e.target.value)
                    }
                    className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000]"
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={
                        formData.estoques[item.id]?.esta_acabando || false
                      }
                      onChange={(e) =>
                        handleEstoqueChange(
                          item.id,
                          'esta_acabando',
                          e.target.checked,
                        )
                      }
                      className="rounded border-gray-300 text-[#d20000] focus:ring-[#d20000]"
                    />
                    <span className="text-gray-700 font-medium">Acabando</span>
                  </label>
                </div>
              ))}
            </div>
          ))}
        </fieldset>

        {/* Mensagem de erro */}
        {error && (
          <div className="text-red-700 bg-red-100 p-3 rounded-md font-semibold">
            {error}
          </div>
        )}

        {/* Botões */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 rounded-md border border-[#d20000] text-[#d20000] hover:bg-[#d20000] hover:text-white transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-md bg-[#d20000] text-white hover:bg-[#c70d0d] transition"
          >
            {existingRelatorio ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RelatorioDiarioForm;
