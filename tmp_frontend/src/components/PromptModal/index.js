import React, { useState, useEffect } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import { i18n } from "../../translate/i18n";
import { MenuItem, FormControl, InputLabel, Select } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { InputAdornment, IconButton } from "@material-ui/core";
import QueueSelectSingle from "../../components/QueueSelectSingle";
import Typography from '@material-ui/core/Typography';
import ExpandMore from '@material-ui/icons/ExpandMore';

import api from "../../services/api";
import toastError from "../../errors/toastError";
import useCompanySettings from "../../hooks/useSettings/companySettings";

// ATENÇÃO: API KEY OPENAI HARDCODED AQUI PARA USO GLOBAL
// Para alterar a chave, edite a constante abaixo:
const OPENAI_API_KEY = "sk-proj-mdKubia1qelJUTLLsEz2OnrLfstmoFWIUv9M-XKrWRenFFm8OHOAiSl7P0vt8nTpxp151fPT3BlbkFJXevdBoga9kJGdks-iqaDGL5x5eAX4P7jX5dgenOtdOolsSzSEC0p33o0PFAketk9WjfP5QEMA";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
    },
    multFieldLine: {
        display: "flex",
        "& > *:not(:last-child)": {
            marginRight: theme.spacing(1),
        },
    },

    btnWrapper: {
        position: "relative",
    },

    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    colorAdorment: {
        width: 20,
        height: 20,
    },
    stepContainer: {
        marginBottom: theme.spacing(3),
    },
    stepTitle: {
        fontWeight: "bold",
        marginBottom: theme.spacing(1),
        color: theme.palette.primary.main,
    },
    stepDescription: {
        marginBottom: theme.spacing(2),
        color: theme.palette.text.secondary,
    },
    advancedOptionsToggle: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        color: theme.palette.primary.main,
    },
    advancedOptionsIcon: {
        marginLeft: theme.spacing(1),
        transition: "transform 0.3s",
    },
    expanded: {
        transform: "rotate(180deg)",
    },
    agentCardsContainer: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: theme.spacing(3),
        marginTop: theme.spacing(3),
    },
    agentCard: {
        width: "160px",
        height: "180px",
        border: "1px solid #ddd",
        borderRadius: theme.spacing(1),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
        padding: theme.spacing(2),
        textAlign: "center",
        "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            borderColor: theme.palette.primary.main,
        },
    },
    agentCardSelected: {
        borderColor: theme.palette.primary.main,
        backgroundColor: "rgba(63, 81, 181, 0.08)",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
    agentIcon: {
        fontSize: 48,
        marginBottom: theme.spacing(1),
        color: theme.palette.primary.main,
    },
    agentName: {
        fontWeight: "bold",
        marginBottom: theme.spacing(0.5),
    },
    agentDescription: {
        fontSize: "0.8rem",
        color: theme.palette.text.secondary,
    },
}));

const PromptSchema = Yup.object().shape({
    name: Yup.string().min(5, "Muito curto!").max(100, "Muito longo!").required("Obrigatório"),
    prompt: Yup.string().min(50, "Muito curto!").required("Descreva o treinamento para Inteligência Artificial"),
    max_tokens: Yup.number().required("Informe o número máximo de tokens"),
    temperature: Yup.number().required("Informe a temperatura"),
    apikey: Yup.string().required("Informe a API Key"),
    queueId: Yup.number().required("Informe a fila"),
    max_messages: Yup.number().required("Informe o número máximo de mensagens")
});

const PromptModal = ({ open, onClose, promptId }) => {
    const classes = useStyles();
    const [selectedVoice, setSelectedVoice] = useState("texto");
    const [showApiKey, setShowApiKey] = useState(false);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5; // Aumentado para 5 passos
    const [useExternalApi, setUseExternalApi] = useState(false);
    const [externalApiUrl, setExternalApiUrl] = useState("");

    const handleToggleApiKey = () => {
        setShowApiKey(!showApiKey);
    };

    const handleToggleAdvancedOptions = () => {
        setShowAdvancedOptions(!showAdvancedOptions);
    };

    const handleNextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const initialState = {
        name: "",
        prompt: "",
        voice: "texto",
        voiceKey: "",
        voiceRegion: "",
        maxTokens: 100, // Aumentado para permitir respostas maiores
        temperature: 1,
        apiKey: OPENAI_API_KEY, // SEMPRE USA A CHAVE HARDCODED
        queueId: null,
        maxMessages: 20 // Aumentado para mais contexto sem exagerar
    };

    const [prompt, setPrompt] = useState(initialState);
    const [selectedAgentModel, setSelectedAgentModel] = useState("");

    // Templates de prompts para os diferentes modelos de agentes
    const agentTemplates = {
        sales: `Você é um agente de vendas especializado em atendimento ao cliente. Seu objetivo é:
1. Saudar o cliente de forma cordial e profissional
2. Identificar as necessidades do cliente fazendo perguntas relevantes
3. Apresentar produtos/serviços que atendam às necessidades identificadas
4. Destacar benefícios e diferenciais
5. Responder a objeções de forma clara e convincente
6. Conduzir o cliente para o fechamento da venda
7. Agradecer pelo interesse e oferecer suporte adicional

Mantenha um tom amigável, profissional e persuasivo. Evite ser agressivo ou pressionar demais o cliente. Foque em entender as necessidades e oferecer soluções que realmente agreguem valor.`,

        support: `Você é um agente de suporte técnico especializado. Seu objetivo é:
1. Saudar o cliente de forma cordial e profissional
2. Identificar o problema técnico através de perguntas específicas
3. Solicitar informações relevantes como versão do sistema, dispositivo, etc.
4. Oferecer soluções passo a passo de forma clara e objetiva
5. Verificar se o problema foi resolvido
6. Fornecer dicas para evitar problemas semelhantes no futuro
7. Encerrar o atendimento de forma educada

Mantenha um tom paciente, claro e objetivo. Use linguagem simples evitando termos técnicos desnecessários. Demonstre empatia com a frustração do cliente e foque em resolver o problema de forma eficiente.`,

        customer_service: `Você é um agente de atendimento ao cliente especializado. Seu objetivo é:
1. Saudar o cliente de forma calorosa e profissional
2. Ouvir atentamente as necessidades, dúvidas ou reclamações
3. Demonstrar empatia e compreensão com a situação
4. Fornecer informações precisas e relevantes
5. Resolver problemas ou encaminhar para o setor adequado
6. Garantir a satisfação do cliente
7. Encerrar o atendimento de forma cordial

Mantenha um tom amigável, respeitoso e prestativo. Seja paciente mesmo em situações difíceis. Priorize a resolução eficiente das questões, mas nunca sacrifique a qualidade do atendimento pela rapidez.`,

        blank: ``
    };

    // Função para preencher o prompt com o template selecionado
    const handleSelectAgentModel = (model) => {
        setSelectedAgentModel(model);
        if (model) {
            // Preenche o campo de prompt com o template selecionado
            setPrompt(prev => ({ ...prev, prompt: agentTemplates[model] }));
        }
        // Avança para a próxima etapa
        handleNextStep();
    };

    // Preencher automaticamente a API Key da OpenAI das configurações globais
    const { get } = useCompanySettings();
    useEffect(() => {
        const fetchOpenAiKey = async () => {
            try {
                const setting = await get({ key: "openAIApiKey" }); // Ajuste a chave se necessário!
                if (setting && setting.value) {
                    setPrompt(prev => ({ ...prev, apiKey: setting.value }));
                }
            } catch (err) {
                // Se não encontrar, apenas não preenche
            }
        };
        if (open) fetchOpenAiKey();
    }, [open]);

    useEffect(() => {
        const fetchPrompt = async () => {
            if (!promptId) {
                setPrompt(initialState);
                setSelectedVoice("texto");
                return;
            }
            try {
                // Adicione um parâmetro para evitar cache
                const { data } = await api.get(`/prompt/${promptId}?_=${Date.now()}`);

                // Verificar se o prompt contém uma URL de API
                const apiUrlMatch = data.prompt.match(/\[API_URL:(.*?)\]/);

                if (apiUrlMatch) {
                    // Extrai a URL da API
                    const apiUrl = apiUrlMatch[1].trim();
                    setUseExternalApi(true);
                    setExternalApiUrl(apiUrl);

                    // Remove o marcador de API do texto do prompt para exibição
                    // mas mantenha uma cópia completa para uso interno
                    const cleanPrompt = { ...data };
                    cleanPrompt.originalPrompt = data.prompt;
                    cleanPrompt.prompt = data.prompt.replace(/\[API_URL:.*?\]\n\n/, "");

                    setPrompt(cleanPrompt);
                } else {
                    setPrompt(data);
                }
                setSelectedVoice(data.voice || "texto");
            } catch (err) {
                toastError(err);
            }
        };
        fetchPrompt();
    }, [promptId, open]);

    const handleClose = () => {
        setPrompt(initialState);
        setSelectedVoice("texto");
        setSelectedAgentModel("");
        setCurrentStep(1);
        onClose();
    };

    const handleChangeVoice = (e) => {
        setSelectedVoice(e.target.value);
    };

    const handleTestApi = async () => {
        if (!externalApiUrl) {
            toast.error("Por favor, informe a URL da API");
            return;
        }

        try {
            toast.info("Testando API externa...", { autoClose: false, toastId: "apiTest" });

            const response = await api.get(`/api/external-proxy?url=${encodeURIComponent(externalApiUrl)}&timeout=30000&maxContentLength=50000000`);
            const apiData = response.data;

            const apiDataString = JSON.stringify(apiData, null, 2);

            setPrompt(prev => ({
                ...prev,
                maxMessages: 0,
                prompt: prev.prompt.includes("{{json}}")
                    ? prev.prompt.replace("{{json}}", apiDataString)
                    : `${prev.prompt}\n\nDados da API:\n\`\`\`json\n${apiDataString}\n\`\`\`\n\nUtilize os dados acima para responder à pergunta ou executar a tarefa solicitada.`
            }));

            // Remover o toast de carregamento e mostrar sucesso
            toast.dismiss("apiTest");
            toast.success("Dados da API carregados com sucesso!");

        } catch (error) {
            // Mostra mensagem de erro
            toast.dismiss("apiTest");
            toastError(`Erro ao consultar API: ${error.message}`);
            console.error("Erro ao testar API externa:", error);
        }
    }

    const handleSavePrompt = async values => {
        try {
            // Debug: mostrar valores que estão sendo enviados
            console.log("Valores sendo enviados:", values);

            // Se estiver usando API externa, adiciona a URL ao prompt
            if (useExternalApi) {
                try {
                    // Define uma URL padrão se o campo estiver vazio
                    const apiUrl = externalApiUrl || "https://example.com/api";
                    console.log("URL da API externa:", apiUrl);

                    // Usa o proxy do backend para fazer a requisição para a API externa
                    const response = await api.get(`/api/external-proxy?url=${encodeURIComponent(apiUrl)}&timeout=30000&maxContentLength=50000000`);
                    const apiData = response.data;

                    // Converte os dados da API para JSON formatado
                    const apiDataString = JSON.stringify(apiData, null, 2);

                    // Substitui o placeholder {{json}} pelos dados da API
                    if (values.prompt.includes("{{json}}")) {
                        values.prompt = values.prompt.replace("{{json}}", apiDataString);
                    } else {
                        // Se não houver placeholder, adiciona os dados ao final do prompt
                        values.prompt = `${values.prompt}\n\nDados da API:\n\`\`\`json\n${apiDataString}\n\`\`\`\n\nUtilize os dados acima para responder à pergunta ou executar a tarefa solicitada.`;
                    }

                    // Armazena a URL da API no prompt para referência futura
                    values.prompt = `[API_URL:${apiUrl}]\n\n${values.prompt}`;
                } catch (error) {
                    console.error("Erro ao processar API externa:", error);
                    // Em vez de mostrar erro e interromper, apenas continua sem a API externa
                    console.log("Continuando sem dados da API externa");

                    // Adiciona uma nota no prompt sobre a falha da API externa
                    if (externalApiUrl) {
                        values.prompt = `[API_URL:${externalApiUrl}]\n\n${values.prompt}\n\nNota: Não foi possível obter dados da API externa.`;
                    }
                }
            }

            // Validar os campos obrigatórios
            if (!values.name || values.name.trim() === "") {
                toastError("Nome do prompt é obrigatório");
                return;
            }

            if (!values.queueId) {
                toastError("Informe o setor");
                return;
            }

            if (!values.prompt || values.prompt.trim() === "") {
                toastError("As instruções para IA são obrigatórias");
                return;
            }

            // Preparar os dados para envio
            const promptData = {
                ...values,
                voice: selectedVoice,
                name: values.name.trim(),
                maxMessages: useExternalApi ? 0 : values.maxMessages
            };

            console.log("Dados finais a serem enviados:", promptData);

            // Enviar para a API
            if (promptId) {
                console.log("Atualizando prompt existente, ID:", promptId);
                try {
                    const response = await api.put(`/prompt/${promptId}`, promptData);
                    console.log("Resposta da API (atualização):", response.data);
                    toast.success(i18n.t("promptModal.success"));
                    handleClose();
                } catch (err) {
                    console.error("Erro detalhado na atualização:", err.response ? err.response.data : err);
                    toastError(`Erro ao atualizar prompt: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
                }
            } else {
                console.log("Criando novo prompt");
                try {
                    const response = await api.post("/prompt", promptData);
                    console.log("Resposta da API (criação):", response.data);
                    toast.success(i18n.t("promptModal.success"));
                    handleClose();
                } catch (err) {
                    console.error("Erro detalhado na criação:", err.response ? err.response.data : err);
                    toastError(`Erro ao criar prompt: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
                }
            }
        } catch (err) {
            console.error("Erro geral:", err);
            toastError(`Erro geral: ${err.message}`);
        }
    };

    return (
        <div className={classes.root}>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                scroll="paper"
                fullWidth
            >
                <DialogTitle id="form-dialog-title">
                    {promptId
                        ? `${i18n.t("promptModal.title.edit")}`
                        : `${i18n.t("promptModal.title.add")}`}
                </DialogTitle>
                <Formik
                    initialValues={prompt}
                    enableReinitialize={true}
                    onSubmit={(values, actions) => {
                        setTimeout(async () => {
                            await handleSavePrompt(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting, values }) => (
                        <Form style={{ width: "100%" }}>
                            <DialogContent dividers>
                                {/* Passo 1: Nome do Prompt */}
                                {currentStep === 1 && (
                                    <div className={classes.stepContainer}>
                                        <Typography variant="h6" className={classes.stepTitle}>
                                            Passo 1: Nome do Prompt
                                        </Typography>
                                        <Typography variant="body2" className={classes.stepDescription}>
                                            Dê um nome descritivo para seu prompt. Este nome será exibido na lista de prompts e ajudará você a identificá-lo facilmente.
                                        </Typography>
                                        <Field
                                            as={TextField}
                                            label={i18n.t("promptModal.form.name")}
                                            name="name"
                                            error={touched.name && Boolean(errors.name)}
                                            helperText={touched.name && errors.name}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                            required
                                        />
                                    </div>
                                )}

                                {/* Passo 2: Seleção de Fila */}
                                {currentStep === 2 && (
                                    <div className={classes.stepContainer}>
                                        <Typography variant="h6" className={classes.stepTitle}>
                                            Passo 2: Selecione o Setor
                                        </Typography>
                                        <Typography variant="body2" className={classes.stepDescription}>
                                            Escolha o setor/departamento. após o bot finalizar o seu atendimento o úsuario sera redirecionado para esse setor/departamento.
                                        </Typography>
                                        <QueueSelectSingle />
                                    </div>
                                )}
                                {currentStep === 3 && (
                                    <div className={classes.stepContainer}>
                                        <Typography variant="h6" className={classes.stepTitle}>
                                            Passo 3: Selecione o Modelo de Agente
                                        </Typography>
                                        <Typography variant="body2" className={classes.stepDescription}>
                                            Selecione o modelo de agente que melhor se adequa ao seu prompt.
                                        </Typography>
                                        <div className={classes.agentCardsContainer}>
                                            <div
                                                className={`${classes.agentCard} ${selectedAgentModel === "sales" ? classes.agentCardSelected : ""}`}
                                                onClick={() => handleSelectAgentModel("sales")}
                                            >
                                                <i className="fas fa-user-tie" style={{ fontSize: 48, marginBottom: 8, color: "#3F51B5" }}></i>
                                                <Typography variant="body1" className={classes.agentName}>
                                                    Vendas
                                                </Typography>
                                                <Typography variant="body2" className={classes.agentDescription}>
                                                    Modelo de agente especializado em vendas.
                                                </Typography>
                                            </div>
                                            <div
                                                className={`${classes.agentCard} ${selectedAgentModel === "support" ? classes.agentCardSelected : ""}`}
                                                onClick={() => handleSelectAgentModel("support")}
                                            >
                                                <i className="fas fa-headset" style={{ fontSize: 48, marginBottom: 8, color: "#3F51B5" }}></i>
                                                <Typography variant="body1" className={classes.agentName}>
                                                    Suporte Técnico
                                                </Typography>
                                                <Typography variant="body2" className={classes.agentDescription}>
                                                    Modelo de agente especializado em suporte técnico.
                                                </Typography>
                                            </div>
                                            <div
                                                className={`${classes.agentCard} ${selectedAgentModel === "customer_service" ? classes.agentCardSelected : ""}`}
                                                onClick={() => handleSelectAgentModel("customer_service")}
                                            >
                                                <i className="fas fa-user" style={{ fontSize: 48, marginBottom: 8, color: "#3F51B5" }}></i>
                                                <Typography variant="body1" className={classes.agentName}>
                                                    Atendimento ao Cliente
                                                </Typography>
                                                <Typography variant="body2" className={classes.agentDescription}>
                                                    Modelo de agente especializado em atendimento ao cliente.
                                                </Typography>
                                            </div>
                                            <div
                                                className={`${classes.agentCard} ${selectedAgentModel === "blank" ? classes.agentCardSelected : ""}`}
                                                onClick={() => handleSelectAgentModel("blank")}
                                            >
                                                <i className="fas fa-file" style={{ fontSize: 48, marginBottom: 8, color: "#3F51B5" }}></i>
                                                <Typography variant="body1" className={classes.agentName}>
                                                    Em Branco
                                                </Typography>
                                                <Typography variant="body2" className={classes.agentDescription}>
                                                    Comece sem um modelo pré-definido.
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Passo 4: Descrição do Prompt */}
                                {currentStep === 4 && (
                                    <div className={classes.stepContainer}>
                                        <Typography variant="h6" className={classes.stepTitle}>
                                            Passo 4: Instruções para a IA
                                        </Typography>
                                        <Typography variant="body2" className={classes.stepDescription}>
                                            Descreva detalhadamente o que a IA deve fazer. Seja específico sobre o tom, estilo e tipo de respostas que você espera. Quanto mais detalhado for seu prompt, melhores serão os resultados.
                                        </Typography>

                                        {/* Opção para usar API externa */}
                                        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                                            <FormControl component="fieldset">
                                                <Typography variant="body2" style={{ marginBottom: '8px' }}>
                                                    Alimentar prompt com API externa:
                                                </Typography>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Button
                                                        variant={useExternalApi ? "contained" : "outlined"}
                                                        color={useExternalApi ? "primary" : "default"}
                                                        onClick={() => {
                                                            setUseExternalApi(true);
                                                            // Define maxMessages como 0 automaticamente quando API externa é ativada
                                                            setPrompt(prev => ({ ...prev, maxMessages: 0 }));
                                                        }}
                                                        style={{ marginRight: '8px' }}
                                                        size="small"
                                                    >
                                                        Sim
                                                    </Button>
                                                    <Button
                                                        variant={!useExternalApi ? "contained" : "outlined"}
                                                        color={!useExternalApi ? "primary" : "default"}
                                                        onClick={() => {
                                                            setUseExternalApi(false);
                                                            // Restaura o valor padrão quando API externa é desativada
                                                            setPrompt(prev => ({ ...prev, maxMessages: 20 }));
                                                        }}
                                                        size="small"
                                                    >
                                                        Não
                                                    </Button>
                                                </div>
                                            </FormControl>
                                        </div>
                                        {useExternalApi && (
                                            <>
                                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                                    <TextField
                                                        label="URL da API Externa (JSON)"
                                                        value={externalApiUrl}
                                                        onChange={(e) => setExternalApiUrl(e.target.value)}
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                        helperText="Insira a URL de uma API que retorne dados em formato JSON para alimentar o prompt"
                                                    />
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={handleTestApi}
                                                        style={{ marginLeft: '8px', marginTop: '8px' }}
                                                        size="medium"
                                                    >
                                                        Testar API
                                                    </Button>
                                                </div>
                                                <Typography
                                                    variant="body2"
                                                    style={{
                                                        marginBottom: '16px',
                                                        color: '#666',
                                                        backgroundColor: '#f5f5f5',
                                                        padding: '8px',
                                                        borderRadius: '4px'
                                                    }}
                                                >
                                                    <strong>Dica:</strong> Você pode usar o placeholder <code>{"{{json}}"}</code> no seu prompt para indicar onde os dados da API devem ser inseridos.
                                                    Se não usar o placeholder, os dados serão adicionados ao final do prompt.
                                                    <br /><br />
                                                    <strong>Exemplo:</strong><br />
                                                    "Liste os produtos disponíveis abaixo com nome, preço e se estão em estoque:<br /><br />
                                                    Produtos:<br />
                                                    {"{{json}}"}
                                                    "
                                                    <br /><br />
                                                    <strong>Nota:</strong> O histórico de mensagens será automaticamente desativado (maxMessages = 0) para garantir que os dados da API externa sejam sempre utilizados sem interferência de mensagens anteriores.
                                                </Typography>
                                            </>
                                        )}
                                        <Field
                                            as={TextField}
                                            label={i18n.t("promptModal.form.prompt")}
                                            name="prompt"
                                            error={touched.prompt && Boolean(errors.prompt)}
                                            helperText={touched.prompt && errors.prompt}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                            required
                                            rows={10}
                                            multiline={true}
                                        />
                                    </div>
                                )}

                                {/* Passo 5: Configurações */}
                                {currentStep === 5 && (
                                    <div className={classes.stepContainer}>
                                        <Typography variant="h6" className={classes.stepTitle}>
                                            Passo 5: Configurações da IA
                                        </Typography>
                                        <Typography variant="body2" className={classes.stepDescription}>
                                            Ajuste os parâmetros para controlar o comportamento da IA. A temperatura controla a criatividade (valores mais altos = mais criatividade), o número máximo de tokens limita o tamanho das respostas, e o histórico define quantas mensagens anteriores serão consideradas para contexto.
                                        </Typography>

                                        <div className={classes.multFieldLine}>
                                            <Field
                                                as={TextField}
                                                label={i18n.t("promptModal.form.temperature")}
                                                name="temperature"
                                                error={touched.temperature && Boolean(errors.temperature)}
                                                helperText={touched.temperature && errors.temperature}
                                                variant="outlined"
                                                margin="dense"
                                                fullWidth
                                            />
                                            <Field
                                                as={TextField}
                                                label={i18n.t("promptModal.form.max_tokens")}
                                                name="maxTokens"
                                                error={touched.maxTokens && Boolean(errors.maxTokens)}
                                                helperText={touched.maxTokens && errors.maxTokens}
                                                variant="outlined"
                                                margin="dense"
                                                fullWidth
                                            />
                                            {!useExternalApi && (
                                                <Field
                                                    as={TextField}
                                                    label={i18n.t("promptModal.form.max_messages")}
                                                    name="maxMessages"
                                                    error={touched.maxMessages && Boolean(errors.maxMessages)}
                                                    helperText={touched.maxMessages && errors.maxMessages}
                                                    variant="outlined"
                                                    margin="dense"
                                                    fullWidth
                                                />
                                            )}
                                        </div>
                                        {useExternalApi && (
                                            <Typography variant="body2" style={{ marginTop: '8px', color: '#666', backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                                                <strong>Nota:</strong> O histórico de mensagens foi desativado automaticamente para garantir que os dados da API externa sejam sempre utilizados sem interferência de mensagens anteriores.
                                            </Typography>
                                        )}

                                        {/* Opções avançadas (ocultas) - mantendo o código comentado para referência futura */}
                                        {/* 
                                        <div 
                                            className={classes.advancedOptionsToggle}
                                            onClick={handleToggleAdvancedOptions}
                                        >
                                            <Typography variant="body2">
                                                Opções avançadas (configuração de voz)
                                            </Typography>
                                            <ExpandMore 
                                                className={`${classes.advancedOptionsIcon} ${showAdvancedOptions ? classes.expanded : ''}`}
                                            />
                                        </div>

                                        {showAdvancedOptions && (
                                            <>
                                                <FormControl fullWidth margin="dense" variant="outlined">
                                                    <InputLabel>{i18n.t("promptModal.form.voice")}</InputLabel>
                                                    <Select
                                                        id="type-select"
                                                        labelWidth={60}
                                                        name="voice"
                                                        value={selectedVoice}
                                                        onChange={handleChangeVoice}
                                                        multiple={false}
                                                    >
                                                        <MenuItem key={"texto"} value={"texto"}>
                                                            Texto
                                                        </MenuItem>
                                                        <MenuItem key={"pt-BR-FranciscaNeural"} value={"pt-BR-FranciscaNeural"}>
                                                            Francisa
                                                        </MenuItem>
                                                        <MenuItem key={"pt-BR-AntonioNeural"} value={"pt-BR-AntonioNeural"}>
                                                            Antônio
                                                        </MenuItem>
                                                        <MenuItem key={"pt-BR-BrendaNeural"} value={"pt-BR-BrendaNeural"}>
                                                            Brenda
                                                        </MenuItem>
                                                        <MenuItem key={"pt-BR-DonatoNeural"} value={"pt-BR-DonatoNeural"}>
                                                            Donato
                                                        </MenuItem>
                                                        <MenuItem key={"pt-BR-ElzaNeural"} value={"pt-BR-ElzaNeural"}>
                                                            Elza
                                                        </MenuItem>
                                                        <MenuItem key={"pt-BR-FabioNeural"} value={"pt-BR-FabioNeural"}>
                                                            Fábio
                                                        </MenuItem>
                                                        <MenuItem key={"pt-BR-GiovannaNeural"} value={"pt-BR-GiovannaNeural"}>
                                                            Giovanna
                                                        </MenuItem>
                                                        <MenuItem key={"pt-BR-HumbertoNeural"} value={"pt-BR-HumbertoNeural"}>
                                                            Humberto
                                                        </MenuItem>
                                                        <MenuItem key={"pt-BR-JulioNeural"} value={"pt-BR-JulioNeural"}>
                                                            Julio
                                                        </MenuItem>
                                                        <MenuItem key={"pt-BR-LeilaNeural"} value={"pt-BR-LeilaNeural"}>
                                                            Leila
                                                        </MenuItem>
                                                        <MenuItem key={"pt-BR-LeticiaNeural"} value={"pt-BR-LeticiaNeural"}>
                                                            Letícia
                                                        </MenuItem>
                                                        <MenuItem key={"pt-BR-ManuelaNeural"} value={"pt-BR-ManuelaNeural"}>
                                                            Manuela
                                                        </MenuItem>
                                                        <MenuItem key={"pt-BR-NicolauNeural"} value={"pt-BR-NicolauNeural"}>
                                                            Nicolau
                                                        </MenuItem>
                                                        <MenuItem key={"pt-BR-ValerioNeural"} value={"pt-BR-ValerioNeural"}>
                                                            Valério
                                                        </MenuItem>
                                                        <MenuItem key={"pt-BR-YaraNeural"} value={"pt-BR-YaraNeural"}>
                                                            Yara
                                                        </MenuItem>
                                                    </Select>
                                                </FormControl>
                                                <div className={classes.multFieldLine}>
                                                    <Field
                                                        as={TextField}
                                                        label={i18n.t("promptModal.form.voiceKey")}
                                                        name="voiceKey"
                                                        error={touched.voiceKey && Boolean(errors.voiceKey)}
                                                        helperText={touched.voiceKey && errors.voiceKey}
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                    />
                                                    <Field
                                                        as={TextField}
                                                        label={i18n.t("promptModal.form.voiceRegion")}
                                                        name="voiceRegion"
                                                        error={touched.voiceRegion && Boolean(errors.voiceRegion)}
                                                        helperText={touched.voiceRegion && errors.voiceRegion}
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                    />
                                                </div>
                                            </>
                                        )}
                                        */}
                                    </div>
                                )}
                            </DialogContent>
                            <DialogActions>
                                {currentStep > 1 && (
                                    <Button
                                        onClick={handlePrevStep}
                                        color="primary"
                                        disabled={isSubmitting}
                                        variant="outlined"
                                    >
                                        Voltar
                                    </Button>
                                )}

                                {currentStep < totalSteps ? (
                                    <Button
                                        onClick={handleNextStep}
                                        color="primary"
                                        disabled={isSubmitting}
                                        variant="contained"
                                    >
                                        Próximo
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleClose}
                                            color="secondary"
                                            disabled={isSubmitting}
                                            variant="outlined"
                                        >
                                            {i18n.t("promptModal.buttons.cancel")}
                                        </Button>
                                        <Button
                                            type="submit"
                                            color="primary"
                                            disabled={isSubmitting}
                                            variant="contained"
                                            className={classes.btnWrapper}
                                        >
                                            {promptId
                                                ? `${i18n.t("promptModal.buttons.okEdit")}`
                                                : `${i18n.t("promptModal.buttons.okAdd")}`}
                                            {isSubmitting && (
                                                <CircularProgress
                                                    size={24}
                                                    className={classes.buttonProgress}
                                                />
                                            )}
                                        </Button>
                                    </>
                                )}
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
};

export default PromptModal;