import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
import useSettings from "../../hooks/useSettings";
import IconButton from "@material-ui/core/IconButton";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import { Helmet } from "react-helmet";
// Removido import estático da logo

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'row',
    background: '#f5f7fa',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  left: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff',
    minWidth: 0,
    padding: '0 32px',
    [theme.breakpoints.down('sm')]: {
      padding: '32px 0',
      minHeight: '60vh',
    },
  },
  right: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#18181a',
    color: '#fff',
    minWidth: 0,
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  loginBox: {
    width: '100%',
    maxWidth: 380,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#fff',
    boxShadow: '0 2px 24px rgba(0,0,0,0.07)',
    borderRadius: 12,
    padding: '40px 32px',
  },
  title: {
    fontWeight: 700,
    fontSize: 28,
    marginBottom: 24,
    color: '#222',
    textAlign: 'left',
    width: '100%',
  },
  form: {
    width: '100%',
    marginTop: 8,
  },
  submit: {
    margin: '24px 0 12px 0',
    background: '#18181a',
    color: '#fff',
    fontWeight: 600,
    '&:hover': {
      background: '#16d841',
    },
  },
  link: {
    color: '#18181a',
    fontWeight: 500,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  forgot: {
    textAlign: 'right',
    width: '100%',
    marginBottom: 8,
  },
  remember: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 8,
  },
  createAccount: {
    marginTop: 16,
    textAlign: 'center',
    width: '100%',
    color: '#888',
  },
  illustration: {
    width: '70%',
    maxWidth: 350,
    marginBottom: 32,
    filter: 'brightness(0) invert(1)', // Faz a imagem ficar branca
  },
  rightText: {
    fontSize: 18,
    fontWeight: 500,
    textAlign: 'center',
    marginTop: 16,
    color: '#fff',
  },
}));

const Login = () => {
  const classes = useStyles();
  const { colorMode } = useContext(ColorModeContext);
  const { appLogoFavicon, appLogoLight, appLogoDark, appName, mode } = colorMode;
  const [user, setUser] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [allowSignup, setAllowSignup] = useState(false);
  const { getPublicSetting } = useSettings();
  const { handleLogin } = useContext(AuthContext);

  const handleChangeInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMe = (e) => {
    setRememberMe(e.target.checked);
  };

  const handlSubmit = (e) => {
    e.preventDefault();
    // Salvar credenciais no localStorage se rememberMe estiver marcado
    if (rememberMe) {
      localStorage.setItem('rememberedUser', JSON.stringify({
        email: user.email,
        timestamp: new Date().getTime()
      }));
    } else {
      localStorage.removeItem('rememberedUser');
    }
    handleLogin(user);
  };

  useEffect(() => {
    // Verificar se há um usuário salvo no localStorage
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      const userData = JSON.parse(rememberedUser);
      // Verificar se os dados não estão expirados (7 dias)
      const now = new Date().getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (now - userData.timestamp < sevenDays) {
        setUser(prev => ({ ...prev, email: userData.email }));
        setRememberMe(true);
      } else {
        localStorage.removeItem('rememberedUser');
      }
    }

    getPublicSetting('allowSignup')
      .then((data) => {
        setAllowSignup(data === 'enabled');
      })
      .catch((error) => {
        console.log('Error reading setting', error);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>{appName || 'Multi100'}</title>
        <link rel="icon" href={appLogoFavicon || '/default-favicon.ico'} />
      </Helmet>
      <div className={classes.root}>
        <div className={classes.left}>
          <div className={classes.loginBox}>
            <div className={classes.title}>Faça seu login</div>
            <form className={classes.form} noValidate onSubmit={handlSubmit}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="E-mail"
                name="email"
                value={user.email}
                onChange={handleChangeInput}
                autoComplete="email"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <span style={{ marginRight: 8, color: '#18181a' }}>
                      <i className="fas fa-envelope"></i>
                    </span>
                  ),
                }}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Senha"
                type={showPassword ? "text" : "password"}
                id="password"
                value={user.password}
                onChange={handleChangeInput}
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <span style={{ marginRight: 8, color: '#18181a' }}>
                      <i className="fas fa-lock"></i>
                    </span>
                  ),
                  endAdornment: (
                    <span 
                      style={{ 
                        cursor: 'pointer', 
                        color: '#999',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 8px'
                      }} 
                      onClick={toggleShowPassword}
                    >
                      {/* Usando texto em vez de ícones para garantir que apareça */}
                      {showPassword ? '⛔' : '👁'}
                    </span>
                  ),
                }}
              />
              <div className={classes.remember}>
                <input 
                  type="checkbox" 
                  id="rememberMe" 
                  style={{ marginRight: 6 }} 
                  checked={rememberMe}
                  onChange={handleRememberMe}
                />
                <label htmlFor="rememberMe" style={{ fontSize: 14, color: '#666' }}>Lembrar de mim</label>
              </div>
              <div className={classes.forgot}>
                <Link href="#" variant="body2" component={RouterLink} to="/recovery-password" className={classes.link}>
                  Esqueci minha senha
                </Link>
              </div>
              <Button type="submit" fullWidth variant="contained" className={classes.submit}>
                Entrar
              </Button>
              
            </form>
          </div>
        </div>
        <div className={classes.right}>
          {/* Logo co.png do diretório public */}
          <img
            src="/co.png"
            alt="Logo"
            className={classes.illustration}
            style={{ maxWidth: 200 }}
          />
          <div className={classes.rightText}>
            A melhor experiencia<br />que você já teve na sua vida.
          </div>
          <div style={{ marginTop: 24, fontSize: 12, color: '#e0e0e0' }}>
            {/* User illustrations by Storyset */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
