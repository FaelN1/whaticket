import React, { useState, useEffect } from "react";
import qs from 'query-string';

import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";

import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

import usePlans from '../../hooks/usePlans';
import { i18n } from "../../translate/i18n";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
    paper: {
        marginTop: theme.spacing(8),
        padding: theme.spacing(4),
        borderRadius: theme.shape.borderRadius,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#fff", // fundo branco do formulário
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%",
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
        padding: theme.spacing(1.5),
        fontSize: "1rem",
        background: '#18181a',
        color: '#fff',
        fontWeight: 600,
        '&:hover': {
            background: '#16d841',
        },
    },
    backButton: {
        margin: theme.spacing(3, 0, 2),
        padding: theme.spacing(1.5),
        fontSize: "1rem",
        background: '#18181a',
        color: '#fff',
        fontWeight: 600,
        '&:hover': {
            background: '#16d841',
        },
    },
}));

const steps = ['Dados Pessoais', 'Empresa', 'Confirmação'];

const UserSchema = [
    // Step 0: Dados Pessoais
    Yup.object().shape({
        name: Yup.string().min(2, 'Muito curto!').max(50, 'Muito longo!').required('Obrigatório'),
        email: Yup.string().email('E-mail inválido').required('Obrigatório'),
        password: Yup.string().min(5, 'Muito curto!').max(50, 'Muito longo!').required('Obrigatório'),
        phone: Yup.string().required('Obrigatório'),
    }),
    // Step 1: Empresa
    Yup.object().shape({
        companyName: Yup.string().min(2, 'Muito curto!').max(50, 'Muito longo!').required('Obrigatório'),
    }),
    // Step 2: Confirmação (sem validação extra)
    Yup.object().shape({}),
];

// --- PlanCard atualizado para exibir somente informações reais vindas do backend ---
const PlanCard = ({ plan, onSelect }) => {
  // Lista de características possíveis e seus labels/icones
  const features = [
    { key: 'users', label: 'Usuários', icon: '👥' },
    { key: 'connections', label: 'Conexões', icon: '🔗' },
    { key: 'queues', label: 'Filas', icon: '📁' },
    { key: 'whatsapp', label: 'WhatsApp', icon: '💬', bool: true },
    { key: 'facebook', label: 'Facebook', icon: '📘', bool: true },
    { key: 'instagram', label: 'Instagram', icon: '📸', bool: true },
    { key: 'typebot', label: 'Typebot/N8N', icon: '🤖', bool: true },
    { key: 'campaigns', label: 'Campanhas', icon: '📢', bool: true },
    { key: 'schedules', label: 'Agendamentos', icon: '📅', bool: true },
    { key: 'internalChat', label: 'Chat Interno', icon: '💬', bool: true },
    { key: 'externalApi', label: 'API Externa', icon: '🌐', bool: true },
  ];
  return (
    <Box boxShadow={3} borderRadius={8} p={3} m={2} bgcolor="#fff" minWidth={260} maxWidth={320} style={{ flex: 1 }}>
      <Typography variant="h6" align="center" gutterBottom style={{ fontWeight: 700 }}>
        {plan.icon && <span style={{ marginRight: 8 }}>{plan.icon}</span>}{plan.name}
      </Typography>
      <Typography variant="h5" align="center" style={{ color: '#27c200', fontWeight: 700 }}>
        {plan.amount !== undefined ? `R$ ${plan.amount}/mês` : 'Consulte'}
      </Typography>
      <Box mt={2} mb={2}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 15 }}>
          {features.map(({ key, label, icon, bool }) =>
            plan[key] !== undefined ? (
              <li key={key}>
                {icon} {label}: <b>{bool ? (plan[key] ? 'Sim' : 'Não') : plan[key]}</b>
              </li>
            ) : null
          )}
        </ul>
      </Box>
      <Button variant="contained" color="primary" fullWidth style={{ fontWeight: 600, background: '#27c200' }} onClick={() => onSelect(plan)}>
        Selecionar
      </Button>
    </Box>
  );
};

const SignUp = () => {
    const classes = useStyles();
    const history = useHistory();
    const { getPlanList } = usePlans();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [formValues, setFormValues] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        companyName: '',
        planId: '',
    });
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            const planList = await getPlanList({ listPublic: 'false' });
            setPlans(planList);
            setLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        document.body.style.background = '#18181A';
    }, []);

    const handleNext = (values) => {
        setFormValues((prev) => ({ ...prev, ...values }));
        setActiveStep((prev) => prev + 1);
    };
    const handleBack = () => setActiveStep((prev) => prev - 1);
    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setFormValues((prev) => ({ ...prev, planId: plan.id }));
    };

    const handleSignUp = async (values) => {
        try {
            await openApi.post('/auth/signup', values);
            toast.success(i18n.t('signup.toasts.success'));
            history.push('/login');
        } catch (err) {
            toastError(err);
        }
    };

    if (loading) {
        return <Typography variant="h6">Carregando planos...</Typography>;
    }

    // Step contents
    const getStepContent = (step, touched, errors, setFieldValue, values) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Field
                                as={TextField}
                                variant="outlined"
                                fullWidth
                                label="Nome"
                                name="name"
                                error={touched.name && Boolean(errors.name)}
                                helperText={touched.name && errors.name}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Field
                                as={TextField}
                                variant="outlined"
                                fullWidth
                                label="Telefone"
                                name="phone"
                                error={touched.phone && Boolean(errors.phone)}
                                helperText={touched.phone && errors.phone}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                variant="outlined"
                                fullWidth
                                label="E-mail"
                                name="email"
                                error={touched.email && Boolean(errors.email)}
                                helperText={touched.email && errors.email}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                variant="outlined"
                                fullWidth
                                label="Senha"
                                name="password"
                                type="password"
                                error={touched.password && Boolean(errors.password)}
                                helperText={touched.password && errors.password}
                            />
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                variant="outlined"
                                fullWidth
                                label="Nome da empresa"
                                name="companyName"
                                error={touched.companyName && Boolean(errors.companyName)}
                                helperText={touched.companyName && errors.companyName}
                            />
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Box>
                        <Typography variant="h6">Confirme seus dados:</Typography>
                        <Box mt={2}>
                            <strong>Nome:</strong> {values.name}<br />
                            <strong>E-mail:</strong> {values.email}<br />
                            <strong>Telefone:</strong> {values.phone}<br />
                            <strong>Empresa:</strong> {values.companyName}<br />
                            <strong>Plano:</strong> {plans.find((p) => p.id === values.planId)?.name || ''}
                        </Box>
                    </Box>
                );
            default:
                return null;
        }
    };

    // --- EXIBIÇÃO DOS PLANOS ---
    if (!selectedPlan) {
        return (
            <Container component="main" maxWidth="md" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#18181A' }}>
                <CssBaseline />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <Typography component="h1" variant="h5" align="center" style={{ fontWeight: 700, marginBottom: 40, color: '#16d841' }}>
                        Escolha o melhor plano para você
                    </Typography>
                    <Grid container spacing={3} justifyContent="center" alignItems="center" style={{ width: '100%' }}>
                        {plans.map((plan) => (
                            <Grid item key={plan.id} xs={12} sm={6} md={4} style={{ display: 'flex', justifyContent: 'center' }}>
                                <PlanCard plan={plan} onSelect={handlePlanSelect} />
                            </Grid>
                        ))}
                    </Grid>
                </div>
            </Container>
        );
    }

    // --- MULTI-STEP FORM APÓS ESCOLHER PLANO ---
    return (
        <Container component="main" maxWidth="sm">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    {i18n.t('signup.title')}
                </Typography>
                <Stepper activeStep={activeStep} alternativeLabel style={{ width: '100%', margin: '24px 0' }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <Formik
                    initialValues={formValues}
                    validationSchema={UserSchema[activeStep]}
                    enableReinitialize
                    onSubmit={(values, actions) => {
                        if (activeStep < steps.length - 1) {
                            handleNext(values);
                            actions.setTouched({});
                            actions.setSubmitting(false);
                        } else {
                            handleSignUp(values);
                            actions.setSubmitting(false);
                        }
                    }}
                >
                    {({ touched, errors, setFieldValue, values, isSubmitting }) => (
                        <Form className={classes.form}>
                            {getStepContent(activeStep, touched, errors, setFieldValue, values)}
                            <Box mt={3} display="flex" justifyContent="space-between">
                                <Button
                                    disabled={activeStep === 0}
                                    onClick={handleBack}
                                    variant="contained"
                                    className={classes.backButton}
                                >
                                    Voltar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    className={classes.submit}
                                    disabled={isSubmitting}
                                >
                                    {activeStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </div>
        </Container>
    );
};

export default SignUp;
