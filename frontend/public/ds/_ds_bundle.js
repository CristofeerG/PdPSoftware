/* @ds-bundle: {"format":4,"namespace":"LaPosadaDelPalomoDesignSystem_aee67b","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"NumericStepper","sourcePath":"components/forms/NumericStepper.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"AppShellDesktop","sourcePath":"components/pos/AppShellDesktop.jsx"},{"name":"AppShellMobile","sourcePath":"components/pos/AppShellMobile.jsx"},{"name":"LoginCard","sourcePath":"components/pos/LoginCard.jsx"},{"name":"MenuItemRow","sourcePath":"components/pos/MenuItemRow.jsx"},{"name":"TableTile","sourcePath":"components/pos/TableTile.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"8c6d7566bdc6","components/core/Button.jsx":"cfad6193e754","components/core/Card.jsx":"27434ecaa19b","components/core/IconButton.jsx":"779c02be96d9","components/feedback/Modal.jsx":"91f1a44b6970","components/forms/Input.jsx":"24a332965d58","components/forms/NumericStepper.jsx":"72cad0e64994","components/forms/Select.jsx":"b29e6a2ca54f","components/forms/Switch.jsx":"a761fdce350d","components/navigation/Tabs.jsx":"8265bfcd5f1d","components/pos/AppShellDesktop.jsx":"8df68bb8e382","components/pos/AppShellMobile.jsx":"d84fa1e22063","components/pos/LoginCard.jsx":"6faa4265568f","components/pos/MenuItemRow.jsx":"36119e024eb6","components/pos/TableTile.jsx":"d05b01ba1cac","ui_kits/bar-pos/CierreScreen.jsx":"b8c91edba236","ui_kits/bar-pos/CuentaScreen.jsx":"5dbc3f586e5a","ui_kits/bar-pos/InventarioScreen.jsx":"a066bb3f823b","ui_kits/bar-pos/MesasScreen.jsx":"e6df8ecc0504","ui_kits/bar-pos/PedidoScreen.jsx":"f771a766a31b","ui_kits/bar-pos/UsuariosScreen.jsx":"8f1711880812","ui_kits/bar-pos/data.js":"b3fa1bd3a27e","ui_kits/mesero-movil/InventarioMovil.jsx":"0f72cce4dccb","ui_kits/mesero-movil/MesasMovil.jsx":"9c0385970d72","ui_kits/mesero-movil/PedidoMovil.jsx":"e27fca0cf031","ui_kits/mesero-movil/ReportesMovil.jsx":"ef8c880d2f04","ui_kits/mesero-movil/UsuariosMovil.jsx":"380d254c29e1","ui_kits/mesero-movil/data.js":"86ed99177eea","ui_kits/shared/roles.js":"a72842995f5a"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.LaPosadaDelPalomoDesignSystem_aee67b = window.LaPosadaDelPalomoDesignSystem_aee67b || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
const tones = {
  free: {
    bg: 'var(--status-free-bg)',
    fg: 'var(--status-free)'
  },
  occupied: {
    bg: 'var(--status-occupied-bg)',
    fg: 'var(--status-occupied)'
  },
  reserved: {
    bg: 'var(--status-reserved-bg)',
    fg: 'var(--status-reserved)'
  },
  warning: {
    bg: 'var(--status-warning-bg)',
    fg: 'var(--status-warning)'
  },
  danger: {
    bg: 'var(--status-danger-bg)',
    fg: 'var(--status-danger)'
  },
  neutral: {
    bg: 'var(--surface-3)',
    fg: 'var(--text-secondary)'
  }
};
function Badge({
  children,
  tone = 'neutral'
}) {
  const t = tones[tone] || tones.neutral;
  return React.createElement('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      borderRadius: 'var(--radius-pill)',
      background: t.bg,
      color: t.fg,
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: 12,
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase'
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function Button({
  children,
  variant = 'primary',
  size = 'm',
  icon,
  disabled,
  onClick
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 'var(--radius-m)',
    transition: 'background var(--duration-fast) var(--ease-standard), transform var(--duration-fast)',
    opacity: disabled ? 0.45 : 1
  };
  const sizes = {
    s: {
      padding: '8px 14px',
      fontSize: 13
    },
    m: {
      padding: '12px 20px',
      fontSize: 15
    },
    l: {
      padding: '16px 26px',
      fontSize: 17
    }
  };
  const variants = {
    primary: {
      background: 'var(--color-gold)',
      color: 'var(--text-on-gold)'
    },
    secondary: {
      background: 'var(--color-red)',
      color: 'var(--text-on-red)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-default)'
    },
    outline: {
      background: 'transparent',
      color: 'var(--color-gold)',
      border: '1px solid var(--border-gold)'
    }
  };
  return React.createElement('button', {
    onClick: disabled ? undefined : onClick,
    disabled,
    style: {
      ...base,
      ...sizes[size],
      ...variants[variant]
    }
  }, icon, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function Card({
  children,
  padding = 'var(--space-5)',
  style
}) {
  return React.createElement('div', {
    style: {
      background: 'var(--surface-2)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-l)',
      boxShadow: 'var(--shadow-card)',
      padding,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function IconButton({
  icon,
  label,
  active,
  onClick,
  size = 40
}) {
  return React.createElement('button', {
    onClick,
    'aria-label': label,
    title: label,
    style: {
      width: size,
      height: size,
      borderRadius: 'var(--radius-m)',
      border: '1px solid ' + (active ? 'var(--border-gold)' : 'var(--border-default)'),
      background: active ? 'rgba(207,168,70,0.14)' : 'var(--surface-2)',
      color: active ? 'var(--color-gold)' : 'var(--text-secondary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background var(--duration-fast)'
    }
  }, icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
function Modal({
  open,
  title,
  children,
  onClose
}) {
  if (!open) return null;
  return React.createElement('div', {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    },
    onClick: onClose
  }, React.createElement('div', {
    onClick: e => e.stopPropagation(),
    style: {
      background: 'var(--surface-2)',
      border: '1px solid var(--border-gold)',
      borderRadius: 'var(--radius-l)',
      boxShadow: 'var(--shadow-raised)',
      padding: 'var(--space-6)',
      minWidth: 320,
      fontFamily: 'var(--font-body)'
    }
  }, title && React.createElement('h3', {
    style: {
      margin: '0 0 16px',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-display)',
      fontWeight: 800
    }
  }, title), children));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function Input({
  label,
  placeholder,
  icon,
  value,
  onChange,
  type = 'text'
}) {
  return React.createElement('label', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: 'var(--font-body)'
    }
  }, label && React.createElement('span', {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-secondary)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase'
    }
  }, label), React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-m)',
      padding: '10px 14px'
    }
  }, icon, React.createElement('input', {
    type,
    value,
    onChange,
    placeholder,
    style: {
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: 'var(--text-primary)',
      fontSize: 15,
      fontFamily: 'var(--font-body)',
      width: '100%'
    }
  })));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/NumericStepper.jsx
try { (() => {
function NumericStepper({
  value = 1,
  onChange,
  min = 0,
  max = 99
}) {
  const dec = () => onChange && onChange(Math.max(min, value - 1));
  const inc = () => onChange && onChange(Math.min(max, value + 1));
  const btn = {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-s)',
    border: '1px solid var(--border-default)',
    background: 'var(--surface-2)',
    color: 'var(--color-gold)',
    fontWeight: 800,
    fontSize: 16,
    cursor: 'pointer'
  };
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: 'var(--font-body)'
    }
  }, React.createElement('button', {
    style: btn,
    onClick: dec
  }, '−'), React.createElement('span', {
    style: {
      minWidth: 20,
      textAlign: 'center',
      fontWeight: 700,
      fontSize: 16,
      color: 'var(--text-primary)'
    }
  }, value), React.createElement('button', {
    style: btn,
    onClick: inc
  }, '+'));
}
Object.assign(__ds_scope, { NumericStepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/NumericStepper.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function Select({
  label,
  value,
  onChange,
  options = []
}) {
  return React.createElement('label', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: 'var(--font-body)'
    }
  }, label && React.createElement('span', {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-secondary)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase'
    }
  }, label), React.createElement('select', {
    value,
    onChange,
    style: {
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-m)',
      padding: '10px 14px',
      color: 'var(--text-primary)',
      fontSize: 15,
      fontFamily: 'var(--font-body)'
    }
  }, options.map((o, i) => React.createElement('option', {
    key: i,
    value: o.value
  }, o.label))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function Switch({
  checked,
  onChange,
  label
}) {
  return React.createElement('label', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: 'var(--font-body)',
      cursor: 'pointer'
    }
  }, React.createElement('span', {
    onClick: () => onChange && onChange(!checked),
    style: {
      width: 44,
      height: 26,
      borderRadius: 'var(--radius-pill)',
      background: checked ? 'var(--color-gold)' : 'var(--surface-3)',
      position: 'relative',
      display: 'inline-block',
      transition: 'background var(--duration-standard)'
    }
  }, React.createElement('span', {
    style: {
      position: 'absolute',
      top: 3,
      left: checked ? 21 : 3,
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: '#1D1E1C',
      transition: 'left var(--duration-standard) var(--ease-standard)'
    }
  })), label && React.createElement('span', {
    style: {
      fontSize: 14,
      color: 'var(--text-primary)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function Tabs({
  items = [],
  active,
  onChange
}) {
  return React.createElement('div', {
    style: {
      display: 'flex',
      gap: 4,
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-m)',
      padding: 4,
      fontFamily: 'var(--font-body)'
    }
  }, items.map(it => React.createElement('button', {
    key: it.value,
    onClick: () => onChange && onChange(it.value),
    style: {
      flex: 1,
      padding: '10px 16px',
      border: 'none',
      borderRadius: 'var(--radius-s)',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 14,
      background: active === it.value ? 'var(--color-gold)' : 'transparent',
      color: active === it.value ? 'var(--text-on-gold)' : 'var(--text-secondary)',
      transition: 'background var(--duration-fast)'
    }
  }, it.label)));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/pos/AppShellDesktop.jsx
try { (() => {
function AppShellDesktop({
  items,
  allowedKeys,
  active,
  onNav,
  user,
  onLogout,
  logoSrc,
  children
}) {
  const visible = items.filter(it => allowedKeys.includes(it.key));
  return React.createElement('div', {
    style: {
      display: 'flex',
      height: '100%',
      background: 'var(--color-bg)',
      fontFamily: 'var(--font-body)'
    }
  }, React.createElement('div', {
    style: {
      width: 220,
      background: 'var(--surface-1)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 14px'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 24,
      padding: '0 6px'
    }
  }, React.createElement('img', {
    src: logoSrc,
    style: {
      width: 38,
      height: 38
    }
  }), React.createElement('div', {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 14,
      color: 'var(--text-primary)',
      lineHeight: 1.1
    }
  }, 'LA POSADA', React.createElement('br'), React.createElement('span', {
    style: {
      color: 'var(--color-red)'
    }
  }, 'DEL PALOMO'))), React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      flex: 1
    }
  }, visible.map(it => React.createElement('button', {
    key: it.key,
    onClick: () => onNav(it.key),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      textAlign: 'left',
      padding: '12px 14px',
      borderRadius: 'var(--radius-m)',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 14,
      fontFamily: 'var(--font-body)',
      background: active === it.key ? 'var(--color-gold)' : 'transparent',
      color: active === it.key ? 'var(--text-on-gold)' : 'var(--text-secondary)'
    }
  }, it.icon && React.createElement('img', {
    src: it.icon,
    style: {
      width: 16,
      height: 16,
      filter: active === it.key ? 'none' : 'invert(1)',
      opacity: active === it.key ? 1 : 0.7
    }
  }), it.label))), user && React.createElement('div', {
    style: {
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, React.createElement('div', {}, React.createElement('div', {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, user.name), React.createElement('div', {
    style: {
      fontSize: 11,
      color: 'var(--color-gold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-caps)'
    }
  }, user.roleLabel)), React.createElement('button', {
    onClick: onLogout,
    title: 'Salir',
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--text-muted)',
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 700
    }
  }, 'Salir'))), React.createElement('div', {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 24,
      minWidth: 0
    }
  }, children));
}
Object.assign(__ds_scope, { AppShellDesktop });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pos/AppShellDesktop.jsx", error: String((e && e.message) || e) }); }

// components/pos/AppShellMobile.jsx
try { (() => {
function AppShellMobile({
  items,
  allowedKeys,
  active,
  onNav,
  user,
  logoSrc,
  children
}) {
  const visible = items.filter(it => allowedKeys.includes(it.key));
  return React.createElement('div', {
    style: {
      width: 390,
      height: 790,
      background: 'var(--color-bg)',
      borderRadius: 36,
      border: '8px solid #0b0b09',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: 'var(--font-body)',
      boxShadow: 'var(--shadow-raised)'
    }
  }, React.createElement('div', {
    style: {
      padding: '18px 20px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, React.createElement('img', {
    src: logoSrc,
    style: {
      width: 32,
      height: 32
    }
  }), React.createElement('div', {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 13,
      color: 'var(--text-primary)',
      lineHeight: 1.1,
      flex: 1
    }
  }, 'LA POSADA', React.createElement('br'), React.createElement('span', {
    style: {
      color: 'var(--color-red)'
    }
  }, 'DEL PALOMO')), user && React.createElement('span', {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--color-gold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-caps)'
    }
  }, user.roleLabel)), React.createElement('div', {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '8px 20px 20px'
    }
  }, children), React.createElement('div', {
    style: {
      display: 'flex',
      borderTop: '1px solid var(--border-subtle)',
      padding: '10px 12px',
      gap: 8
    }
  }, visible.map(it => React.createElement('button', {
    key: it.key,
    onClick: () => onNav(it.key),
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      padding: '10px 4px',
      borderRadius: 'var(--radius-m)',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 11,
      fontFamily: 'var(--font-body)',
      background: active === it.key ? 'var(--color-gold)' : 'transparent',
      color: active === it.key ? 'var(--text-on-gold)' : 'var(--text-secondary)'
    }
  }, it.icon && React.createElement('img', {
    src: it.icon,
    style: {
      width: 18,
      height: 18,
      filter: active === it.key ? 'none' : 'invert(1)',
      opacity: active === it.key ? 1 : 0.7
    }
  }), it.label))));
}
Object.assign(__ds_scope, { AppShellMobile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pos/AppShellMobile.jsx", error: String((e && e.message) || e) }); }

// components/pos/LoginCard.jsx
try { (() => {
function LoginCard({
  logoSrc,
  roles,
  onSubmit,
  error
}) {
  const [usuario, setUsuario] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState(roles && roles[0] ? roles[0].value : '');
  return React.createElement('div', {
    style: {
      width: 360,
      background: 'var(--surface-2)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-l)',
      boxShadow: 'var(--shadow-raised)',
      padding: 'var(--space-8) var(--space-7)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-6)',
      fontFamily: 'var(--font-body)'
    }
  }, React.createElement('img', {
    src: logoSrc,
    style: {
      width: 96,
      height: 96
    }
  }), React.createElement('div', {
    style: {
      textAlign: 'center'
    }
  }, React.createElement('div', {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 22,
      color: 'var(--text-primary)',
      lineHeight: 1.15
    }
  }, 'LA POSADA'), React.createElement('div', {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 22,
      color: 'var(--color-red)',
      lineHeight: 1.15
    }
  }, 'DEL PALOMO'), React.createElement('div', {
    style: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--color-gold)',
      marginTop: 6
    }
  }, 'Punto de venta')), React.createElement('form', {
    style: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    },
    onSubmit: e => {
      e.preventDefault();
      onSubmit && onSubmit({
        usuario,
        password,
        role
      });
    }
  }, React.createElement('label', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, React.createElement('span', {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-secondary)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase'
    }
  }, 'Usuario'), React.createElement('input', {
    value: usuario,
    onChange: e => setUsuario(e.target.value),
    placeholder: 'jorge.m',
    style: {
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-m)',
      padding: '12px 14px',
      color: 'var(--text-primary)',
      fontSize: 15,
      fontFamily: 'var(--font-body)'
    }
  })), React.createElement('label', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, React.createElement('span', {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-secondary)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase'
    }
  }, 'Contraseña'), React.createElement('input', {
    type: 'password',
    value: password,
    onChange: e => setPassword(e.target.value),
    placeholder: '••••••',
    style: {
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-m)',
      padding: '12px 14px',
      color: 'var(--text-primary)',
      fontSize: 15,
      fontFamily: 'var(--font-body)'
    }
  })), roles && roles.length > 0 && React.createElement('label', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, React.createElement('span', {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-secondary)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase'
    }
  }, 'Perfil'), React.createElement('select', {
    value: role,
    onChange: e => setRole(e.target.value),
    style: {
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-m)',
      padding: '12px 14px',
      color: 'var(--text-primary)',
      fontSize: 15,
      fontFamily: 'var(--font-body)'
    }
  }, roles.map(r => React.createElement('option', {
    key: r.value,
    value: r.value
  }, r.label)))), error && React.createElement('div', {
    style: {
      color: 'var(--status-danger)',
      fontSize: 13
    }
  }, error), React.createElement('button', {
    type: 'submit',
    style: {
      padding: '14px 20px',
      borderRadius: 'var(--radius-m)',
      border: 'none',
      background: 'var(--color-gold)',
      color: 'var(--text-on-gold)',
      fontWeight: 800,
      fontSize: 15,
      cursor: 'pointer',
      fontFamily: 'var(--font-body)'
    }
  }, 'Entrar')));
}
Object.assign(__ds_scope, { LoginCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pos/LoginCard.jsx", error: String((e && e.message) || e) }); }

// components/pos/MenuItemRow.jsx
try { (() => {
function MenuItemRow({
  name,
  price,
  qty = 1,
  onQtyChange,
  note
}) {
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid var(--border-subtle)',
      fontFamily: 'var(--font-body)'
    }
  }, React.createElement('div', {}, React.createElement('div', {
    style: {
      fontWeight: 700,
      fontSize: 15,
      color: 'var(--text-primary)'
    }
  }, name), note && React.createElement('div', {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, note)), React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, React.createElement('span', {
    style: {
      fontSize: 14,
      color: 'var(--text-secondary)',
      minWidth: 60,
      textAlign: 'right'
    }
  }, '$' + (price * qty).toFixed(2)), onQtyChange && React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, React.createElement('button', {
    onClick: () => onQtyChange(Math.max(0, qty - 1)),
    style: {
      width: 26,
      height: 26,
      borderRadius: 6,
      border: '1px solid var(--border-default)',
      background: 'var(--surface-2)',
      color: 'var(--color-gold)',
      cursor: 'pointer'
    }
  }, '−'), React.createElement('span', {
    style: {
      minWidth: 14,
      textAlign: 'center',
      color: 'var(--text-primary)'
    }
  }, qty), React.createElement('button', {
    onClick: () => onQtyChange(qty + 1),
    style: {
      width: 26,
      height: 26,
      borderRadius: 6,
      border: '1px solid var(--border-default)',
      background: 'var(--surface-2)',
      color: 'var(--color-gold)',
      cursor: 'pointer'
    }
  }, '+'))));
}
Object.assign(__ds_scope, { MenuItemRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pos/MenuItemRow.jsx", error: String((e && e.message) || e) }); }

// components/pos/TableTile.jsx
try { (() => {
const cfg = {
  free: {
    bg: 'var(--status-free-bg)',
    border: 'var(--status-free)',
    label: 'Libre'
  },
  occupied: {
    bg: 'var(--status-occupied-bg)',
    border: 'var(--status-occupied)',
    label: 'Ocupada'
  },
  reserved: {
    bg: 'var(--status-reserved-bg)',
    border: 'var(--status-reserved)',
    label: 'Reservada'
  }
};
function TableTile({
  number,
  status = 'free',
  total,
  onClick
}) {
  const c = cfg[status] || cfg.free;
  return React.createElement('button', {
    onClick,
    style: {
      width: 120,
      height: 100,
      borderRadius: 'var(--radius-m)',
      background: c.bg,
      border: '1.5px solid ' + c.border,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      color: 'var(--text-primary)'
    }
  }, React.createElement('span', {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 26
    }
  }, number), React.createElement('span', {
    style: {
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-caps)',
      color: c.border
    }
  }, c.label), total != null && React.createElement('span', {
    style: {
      fontSize: 12,
      color: 'var(--text-secondary)'
    }
  }, '$' + total));
}
Object.assign(__ds_scope, { TableTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pos/TableTile.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bar-pos/CierreScreen.jsx
try { (() => {
const NSz = window.LaPosadaDelPalomoDesignSystem_aee67b;
function CierreScreen() {
  const D = window.BARPOS_DATA;
  const [open, setOpen] = React.useState(false);
  const totalVentas = D.meseros.reduce((s, m) => s + m.ventas, 0);
  const totalPropinas = D.meseros.reduce((s, m) => s + m.propinas, 0);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 16,
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(NSz.Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-caps)',
      marginBottom: 8
    }
  }, "Ventas totales"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 28,
      color: 'var(--color-gold)'
    }
  }, "$", totalVentas)), /*#__PURE__*/React.createElement(NSz.Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-caps)',
      marginBottom: 8
    }
  }, "Propinas"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 28,
      color: 'var(--text-primary)'
    }
  }, "$", totalPropinas)), /*#__PURE__*/React.createElement(NSz.Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-caps)',
      marginBottom: 8
    }
  }, "Mesas atendidas"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 28,
      color: 'var(--text-primary)'
    }
  }, "12"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-2)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-l)',
      overflow: 'hidden',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1fr',
      padding: '12px 20px',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Mesero"), /*#__PURE__*/React.createElement("span", null, "Mesas"), /*#__PURE__*/React.createElement("span", null, "Ventas"), /*#__PURE__*/React.createElement("span", null, "Propinas")), D.meseros.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.name,
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1fr',
      padding: '14px 20px',
      borderBottom: '1px solid var(--border-subtle)',
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)',
      fontWeight: 600
    }
  }, m.name), /*#__PURE__*/React.createElement("span", null, m.mesas), /*#__PURE__*/React.createElement("span", null, "$", m.ventas), /*#__PURE__*/React.createElement("span", null, "$", m.propinas)))), /*#__PURE__*/React.createElement(NSz.Button, {
    variant: "secondary",
    onClick: () => setOpen(true)
  }, "Cerrar turno"), /*#__PURE__*/React.createElement(NSz.Modal, {
    open: open,
    title: "Cerrar turno",
    onClose: () => setOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-secondary)',
      marginBottom: 16
    }
  }, "Se generara el corte de caja del turno de la tarde. Esta accion no se puede deshacer."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(NSz.Button, {
    variant: "secondary",
    onClick: () => setOpen(false)
  }, "Confirmar cierre"), /*#__PURE__*/React.createElement(NSz.Button, {
    variant: "ghost",
    onClick: () => setOpen(false)
  }, "Cancelar"))));
}
window.CierreScreen = CierreScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bar-pos/CierreScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bar-pos/CuentaScreen.jsx
try { (() => {
const NSc = window.LaPosadaDelPalomoDesignSystem_aee67b;
function CuentaScreen({
  mesa
}) {
  const items = [{
    name: 'Michelada',
    price: 90,
    qty: 2
  }, {
    name: 'Alitas BBQ (12pz)',
    price: 210,
    qty: 1
  }, {
    name: 'Hora de karaoke',
    price: 180,
    qty: 2
  }];
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const propina = Math.round(subtotal * 0.10);
  const total = subtotal + propina;
  const [open, setOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(NSc.Card, {
    style: {
      width: 420
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      color: 'var(--text-primary)',
      marginBottom: 4,
      fontSize: 20
    }
  }, "Mesa ", mesa ? mesa.n : 5), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 13,
      marginBottom: 12
    }
  }, "Abierta hace 1h 40min \xB7 Mesero: Ana"), items.map(i => /*#__PURE__*/React.createElement(NSc.MenuItemRow, {
    key: i.name,
    name: i.name,
    price: i.price,
    qty: i.qty
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      color: 'var(--text-secondary)',
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Subtotal"), /*#__PURE__*/React.createElement("span", null, "$", subtotal.toFixed(2))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Propina sugerida (10%)"), /*#__PURE__*/React.createElement("span", null, "$", propina.toFixed(2))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontWeight: 800,
      fontSize: 18,
      color: 'var(--text-primary)',
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total"), /*#__PURE__*/React.createElement("span", null, "$", total.toFixed(2))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      width: 260
    }
  }, /*#__PURE__*/React.createElement(NSc.Select, {
    label: "Metodo de pago",
    options: [{
      label: 'Efectivo',
      value: 'cash'
    }, {
      label: 'Tarjeta',
      value: 'card'
    }, {
      label: 'Transferencia',
      value: 'transfer'
    }]
  }), /*#__PURE__*/React.createElement(NSc.Button, {
    variant: "primary",
    onClick: () => setOpen(true)
  }, "Cobrar mesa"), /*#__PURE__*/React.createElement(NSc.Button, {
    variant: "ghost"
  }, "Dividir cuenta")), /*#__PURE__*/React.createElement(NSc.Modal, {
    open: open,
    title: "Confirmar cobro",
    onClose: () => setOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-secondary)',
      marginBottom: 16
    }
  }, "Cobrar $", total.toFixed(2), " a mesa 5 y cerrar cuenta."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(NSc.Button, {
    variant: "primary",
    onClick: () => setOpen(false)
  }, "Confirmar"), /*#__PURE__*/React.createElement(NSc.Button, {
    variant: "ghost",
    onClick: () => setOpen(false)
  }, "Cancelar"))));
}
window.CuentaScreen = CuentaScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bar-pos/CuentaScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bar-pos/InventarioScreen.jsx
try { (() => {
const NSi = window.LaPosadaDelPalomoDesignSystem_aee67b;
function InventarioScreen() {
  const D = window.BARPOS_DATA;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      marginBottom: 20,
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(NSi.Input, {
    label: "Buscar producto",
    placeholder: "Tequila, limon..."
  }), /*#__PURE__*/React.createElement(NSi.Select, {
    label: "Categoria",
    options: [{
      label: 'Todas',
      value: 'all'
    }, {
      label: 'Bebidas',
      value: 'bebidas'
    }, {
      label: 'Cocina',
      value: 'cocina'
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-2)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-l)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1fr',
      padding: '12px 20px',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Producto"), /*#__PURE__*/React.createElement("span", null, "Existencia"), /*#__PURE__*/React.createElement("span", null, "Unidad"), /*#__PURE__*/React.createElement("span", null, "Estado")), D.inventario.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.name,
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1fr',
      padding: '14px 20px',
      borderBottom: '1px solid var(--border-subtle)',
      alignItems: 'center',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)',
      fontWeight: 600
    }
  }, p.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, p.stock), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, p.unit), /*#__PURE__*/React.createElement("span", null, p.low ? /*#__PURE__*/React.createElement(NSi.Badge, {
    tone: "danger"
  }, "Bajo stock") : /*#__PURE__*/React.createElement(NSi.Badge, {
    tone: "free"
  }, "OK"))))));
}
window.InventarioScreen = InventarioScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bar-pos/InventarioScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bar-pos/MesasScreen.jsx
try { (() => {
const NSm = window.LaPosadaDelPalomoDesignSystem_aee67b;
function MesasScreen() {
  const D = window.BARPOS_DATA;
  const [zona, setZona] = React.useState('main');
  const [soloActivas, setSoloActivas] = React.useState(false);
  const [drill, setDrill] = React.useState(null);
  const mesas = soloActivas ? D.mesas.filter(m => m.status === 'occupied') : D.mesas;
  const openMesa = m => setDrill(m);
  if (drill) {
    const Screen = drill.status === 'occupied' ? window.CuentaScreen : window.PedidoScreen;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
      onClick: () => setDrill(null),
      style: {
        background: 'none',
        border: 'none',
        color: 'var(--color-gold)',
        fontWeight: 700,
        cursor: 'pointer',
        marginBottom: 16,
        padding: 0,
        fontFamily: 'var(--font-body)',
        fontSize: 14
      }
    }, "\u2190 Volver a mesas"), /*#__PURE__*/React.createElement(Screen, {
      mesa: drill
    }));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      marginBottom: 20,
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(NSm.Input, {
    label: "Buscar mesa",
    placeholder: "Numero de mesa"
  }), /*#__PURE__*/React.createElement(NSm.Select, {
    label: "Zona",
    value: zona,
    onChange: e => setZona(e.target.value),
    options: [{
      label: 'Salon principal',
      value: 'main'
    }, {
      label: 'Terraza',
      value: 'terraza'
    }, {
      label: 'Privados karaoke',
      value: 'privados'
    }]
  }), /*#__PURE__*/React.createElement(NSm.Tabs, {
    items: [{
      label: 'Todas',
      value: 'todas'
    }, {
      label: 'Activas',
      value: 'activas'
    }],
    active: soloActivas ? 'activas' : 'todas',
    onChange: v => setSoloActivas(v === 'activas')
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      marginLeft: 'auto',
      fontSize: 13,
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--status-free)'
    }
  }, "\u25CF"), " Libre"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--status-occupied)'
    }
  }, "\u25CF"), " Ocupada"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--status-reserved)'
    }
  }, "\u25CF"), " Reservada"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 120px)',
      gap: 16
    }
  }, mesas.map(m => /*#__PURE__*/React.createElement(NSm.TableTile, {
    key: m.n,
    number: m.n,
    status: m.status,
    total: m.total,
    onClick: () => openMesa(m)
  }))));
}
window.MesasScreen = MesasScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bar-pos/MesasScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bar-pos/PedidoScreen.jsx
try { (() => {
const NSp = window.LaPosadaDelPalomoDesignSystem_aee67b;
function PedidoScreen({
  mesa
}) {
  const D = window.BARPOS_DATA;
  const [cat, setCat] = React.useState(D.categorias[0]);
  const [cart, setCart] = React.useState([{
    name: 'Michelada',
    price: 90,
    qty: 2
  }, {
    name: 'Alitas BBQ (12pz)',
    price: 210,
    qty: 1
  }]);
  const add = p => setCart(c => {
    const i = c.findIndex(x => x.name === p.name);
    if (i >= 0) {
      const n = [...c];
      n[i] = {
        ...n[i],
        qty: n[i].qty + 1
      };
      return n;
    }
    return [...c, {
      name: p.name,
      price: p.price,
      qty: 1
    }];
  });
  const setQty = (name, qty) => setCart(c => qty <= 0 ? c.filter(x => x.name !== name) : c.map(x => x.name === name ? {
    ...x,
    qty
  } : x));
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(NSp.Tabs, {
    items: D.categorias.map(c => ({
      label: c,
      value: c
    })),
    active: cat,
    onChange: setCat
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 12,
      marginTop: 20
    }
  }, D.productos.filter(p => p.cat === cat).map(p => /*#__PURE__*/React.createElement("button", {
    key: p.name,
    onClick: () => add(p),
    style: {
      textAlign: 'left',
      padding: 16,
      borderRadius: 'var(--radius-m)',
      background: 'var(--surface-2)',
      border: '1px solid var(--border-subtle)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15,
      color: 'var(--text-primary)',
      marginBottom: 6
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--color-gold)',
      fontWeight: 700
    }
  }, "$", p.price))))), /*#__PURE__*/React.createElement(NSp.Card, {
    style: {
      width: 320,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      color: 'var(--text-primary)',
      marginBottom: 8
    }
  }, "Mesa ", mesa ? mesa.n : 12, " \xB7 Pedido"), /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: 280,
      overflow: 'auto'
    }
  }, cart.map(i => /*#__PURE__*/React.createElement(NSp.MenuItemRow, {
    key: i.name,
    name: i.name,
    price: i.price,
    qty: i.qty,
    onQtyChange: q => setQty(i.name, q)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '16px 0',
      fontWeight: 800,
      color: 'var(--text-primary)',
      fontSize: 16
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total"), /*#__PURE__*/React.createElement("span", null, "$", total.toFixed(2))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(NSp.Button, {
    variant: "outline"
  }, "Guardar"), /*#__PURE__*/React.createElement(NSp.Button, {
    variant: "primary"
  }, "Enviar a barra"))));
}
window.PedidoScreen = PedidoScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bar-pos/PedidoScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bar-pos/UsuariosScreen.jsx
try { (() => {
const NSu = window.LaPosadaDelPalomoDesignSystem_aee67b;
function UsuariosScreen() {
  const staff = window.POS_STAFF;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(NSu.Input, {
    label: "Buscar usuario",
    placeholder: "Nombre"
  }), /*#__PURE__*/React.createElement(NSu.Button, {
    variant: "primary"
  }, "Agregar usuario")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-2)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-l)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr',
      padding: '12px 20px',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Nombre"), /*#__PURE__*/React.createElement("span", null, "Perfil"), /*#__PURE__*/React.createElement("span", null, "Estado")), staff.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.name,
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr',
      padding: '14px 20px',
      borderBottom: '1px solid var(--border-subtle)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)',
      fontWeight: 600
    }
  }, s.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, s.role), /*#__PURE__*/React.createElement("span", null, s.status === 'Activo' ? /*#__PURE__*/React.createElement(NSu.Badge, {
    tone: "free"
  }, "Activo") : /*#__PURE__*/React.createElement(NSu.Badge, {
    tone: "neutral"
  }, "Inactivo"))))));
}
window.UsuariosScreen = UsuariosScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bar-pos/UsuariosScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bar-pos/data.js
try { (() => {
window.BARPOS_DATA = {
  mesas: [{
    n: 1,
    status: 'free'
  }, {
    n: 2,
    status: 'occupied',
    total: 320
  }, {
    n: 3,
    status: 'free'
  }, {
    n: 4,
    status: 'reserved'
  }, {
    n: 5,
    status: 'occupied',
    total: 620
  }, {
    n: 6,
    status: 'free'
  }, {
    n: 7,
    status: 'occupied',
    total: 150
  }, {
    n: 8,
    status: 'free'
  }, {
    n: 9,
    status: 'reserved'
  }, {
    n: 10,
    status: 'occupied',
    total: 480
  }, {
    n: 11,
    status: 'free'
  }, {
    n: 12,
    status: 'occupied',
    total: 210
  }],
  categorias: ['Cervezas', 'Cocteles', 'Botellas', 'Alitas y botanas', 'Karaoke (horas)'],
  productos: [{
    name: 'Michelada',
    price: 90,
    cat: 'Cervezas'
  }, {
    name: 'Cerveza nacional',
    price: 55,
    cat: 'Cervezas'
  }, {
    name: 'Margarita',
    price: 120,
    cat: 'Cocteles'
  }, {
    name: 'Paloma',
    price: 110,
    cat: 'Cocteles'
  }, {
    name: 'Tequila reposado (copa)',
    price: 95,
    cat: 'Botellas'
  }, {
    name: 'Whisky (botella)',
    price: 1450,
    cat: 'Botellas'
  }, {
    name: 'Alitas BBQ (12pz)',
    price: 210,
    cat: 'Alitas y botanas'
  }, {
    name: 'Papas gajo',
    price: 95,
    cat: 'Alitas y botanas'
  }, {
    name: 'Hora de karaoke',
    price: 180,
    cat: 'Karaoke (horas)'
  }],
  inventario: [{
    name: 'Cerveza nacional',
    stock: 142,
    unit: 'botellas',
    low: false
  }, {
    name: 'Tequila reposado',
    stock: 6,
    unit: 'litros',
    low: true
  }, {
    name: 'Limón',
    stock: 3,
    unit: 'kg',
    low: true
  }, {
    name: 'Alitas de pollo',
    stock: 22,
    unit: 'kg',
    low: false
  }, {
    name: 'Whisky',
    stock: 9,
    unit: 'botellas',
    low: false
  }, {
    name: 'Hielo',
    stock: 40,
    unit: 'kg',
    low: false
  }],
  meseros: [{
    name: 'Jorge',
    mesas: 4,
    ventas: 2340,
    propinas: 210
  }, {
    name: 'Ana',
    mesas: 3,
    ventas: 1890,
    propinas: 180
  }, {
    name: 'Luis',
    mesas: 5,
    ventas: 3120,
    propinas: 290
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bar-pos/data.js", error: String((e && e.message) || e) }); }

// ui_kits/mesero-movil/InventarioMovil.jsx
try { (() => {
const NSim = window.LaPosadaDelPalomoDesignSystem_aee67b;
function InventarioMovil() {
  const D = window.MESERO_DATA || {
    inventario: []
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 18,
      margin: '6px 0 14px'
    }
  }, "Inventario"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, (D.inventario || []).map(p => /*#__PURE__*/React.createElement(NSim.Card, {
    key: p.name,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, p.stock, " ", p.unit)), p.low ? /*#__PURE__*/React.createElement(NSim.Badge, {
    tone: "danger"
  }, "Bajo") : /*#__PURE__*/React.createElement(NSim.Badge, {
    tone: "free"
  }, "OK")))));
}
window.InventarioMovil = InventarioMovil;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mesero-movil/InventarioMovil.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mesero-movil/MesasMovil.jsx
try { (() => {
const NSmm = window.LaPosadaDelPalomoDesignSystem_aee67b;
function MesasMovil() {
  const D = window.MESERO_DATA;
  const [soloActivas, setSoloActivas] = React.useState(false);
  const [drill, setDrill] = React.useState(null);
  const mesas = soloActivas ? D.mesas.filter(m => m.status === 'occupied') : D.mesas;
  if (drill) {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
      onClick: () => setDrill(null),
      style: {
        background: 'none',
        border: 'none',
        color: 'var(--color-gold)',
        fontWeight: 700,
        cursor: 'pointer',
        marginBottom: 14,
        padding: 0,
        fontFamily: 'var(--font-body)',
        fontSize: 14
      }
    }, "\u2190 Volver a mesas"), /*#__PURE__*/React.createElement(window.PedidoMovil, {
      mesa: drill
    }));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '6px 0 14px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 18
    }
  }, "Mapa de mesas")), /*#__PURE__*/React.createElement(NSmm.Tabs, {
    items: [{
      label: 'Todas',
      value: 'todas'
    }, {
      label: 'Activas',
      value: 'activas'
    }],
    active: soloActivas ? 'activas' : 'todas',
    onChange: v => setSoloActivas(v === 'activas')
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 12,
      marginTop: 14
    }
  }, mesas.map(m => /*#__PURE__*/React.createElement(NSmm.TableTile, {
    key: m.n,
    number: m.n,
    status: m.status,
    total: m.total,
    onClick: () => setDrill(m)
  }))));
}
window.MesasMovil = MesasMovil;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mesero-movil/MesasMovil.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mesero-movil/PedidoMovil.jsx
try { (() => {
const NSpm = window.LaPosadaDelPalomoDesignSystem_aee67b;
function PedidoMovil({
  mesa
}) {
  const D = window.MESERO_DATA;
  const [cat, setCat] = React.useState(D.categorias[0]);
  const [cart, setCart] = React.useState([{
    name: 'Michelada',
    price: 90,
    qty: 2
  }]);
  const add = p => setCart(c => {
    const i = c.findIndex(x => x.name === p.name);
    if (i >= 0) {
      const n = [...c];
      n[i] = {
        ...n[i],
        qty: n[i].qty + 1
      };
      return n;
    }
    return [...c, {
      name: p.name,
      price: p.price,
      qty: 1
    }];
  });
  const setQty = (name, qty) => setCart(c => qty <= 0 ? c.filter(x => x.name !== name) : c.map(x => x.name === name ? {
    ...x,
    qty
  } : x));
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 18,
      margin: '6px 0 14px'
    }
  }, "Mesa ", mesa ? mesa.n : 2, " \xB7 Nuevo pedido"), /*#__PURE__*/React.createElement(NSpm.Tabs, {
    items: D.categorias.map(c => ({
      label: c,
      value: c
    })),
    active: cat,
    onChange: setCat
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      margin: '16px 0'
    }
  }, D.productos.filter(p => p.cat === cat).map(p => /*#__PURE__*/React.createElement("button", {
    key: p.name,
    onClick: () => add(p),
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 16px',
      borderRadius: 'var(--radius-m)',
      background: 'var(--surface-2)',
      border: '1px solid var(--border-subtle)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)',
      fontWeight: 600
    }
  }, p.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-gold)',
      fontWeight: 700
    }
  }, "$", p.price)))), cart.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: 12
    }
  }, cart.map(i => /*#__PURE__*/React.createElement(NSpm.MenuItemRow, {
    key: i.name,
    name: i.name,
    price: i.price,
    qty: i.qty,
    onQtyChange: q => setQty(i.name, q)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '14px 0',
      fontWeight: 800,
      color: 'var(--text-primary)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total"), /*#__PURE__*/React.createElement("span", null, "$", total.toFixed(2))), /*#__PURE__*/React.createElement(NSpm.Button, {
    variant: "primary",
    style: {
      width: '100%'
    }
  }, "Enviar a barra")));
}
window.PedidoMovil = PedidoMovil;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mesero-movil/PedidoMovil.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mesero-movil/ReportesMovil.jsx
try { (() => {
const NSrm = window.LaPosadaDelPalomoDesignSystem_aee67b;
function ReportesMovil() {
  const D = window.MESERO_DATA || {
    meseros: []
  };
  const [open, setOpen] = React.useState(false);
  const totalVentas = (D.meseros || []).reduce((s, m) => s + m.ventas, 0);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 18,
      margin: '6px 0 14px'
    }
  }, "Reportes"), /*#__PURE__*/React.createElement(NSrm.Card, {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-caps)',
      marginBottom: 8
    }
  }, "Ventas del turno"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 26,
      color: 'var(--color-gold)'
    }
  }, "$", totalVentas)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      marginBottom: 20
    }
  }, (D.meseros || []).map(m => /*#__PURE__*/React.createElement(NSrm.Card, {
    key: m.name,
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, m.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, "$", m.ventas)))), /*#__PURE__*/React.createElement(NSrm.Button, {
    variant: "secondary",
    style: {
      width: '100%'
    },
    onClick: () => setOpen(true)
  }, "Cerrar turno"), /*#__PURE__*/React.createElement(NSrm.Modal, {
    open: open,
    title: "Cerrar turno",
    onClose: () => setOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-secondary)',
      marginBottom: 16
    }
  }, "Se generara el corte de caja. Esta accion no se puede deshacer."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(NSrm.Button, {
    variant: "secondary",
    onClick: () => setOpen(false)
  }, "Confirmar"), /*#__PURE__*/React.createElement(NSrm.Button, {
    variant: "ghost",
    onClick: () => setOpen(false)
  }, "Cancelar"))));
}
window.ReportesMovil = ReportesMovil;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mesero-movil/ReportesMovil.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mesero-movil/UsuariosMovil.jsx
try { (() => {
const NSum = window.LaPosadaDelPalomoDesignSystem_aee67b;
function UsuariosMovil() {
  const staff = window.POS_STAFF || [];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 18,
      margin: '6px 0 14px'
    }
  }, "Usuarios"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, staff.map(s => /*#__PURE__*/React.createElement(NSum.Card, {
    key: s.name,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, s.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, s.role)), s.status === 'Activo' ? /*#__PURE__*/React.createElement(NSum.Badge, {
    tone: "free"
  }, "Activo") : /*#__PURE__*/React.createElement(NSum.Badge, {
    tone: "neutral"
  }, "Inactivo")))));
}
window.UsuariosMovil = UsuariosMovil;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mesero-movil/UsuariosMovil.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mesero-movil/data.js
try { (() => {
window.MESERO_DATA = {
  mesas: [{
    n: 1,
    status: 'free'
  }, {
    n: 2,
    status: 'occupied',
    total: 320
  }, {
    n: 3,
    status: 'free'
  }, {
    n: 4,
    status: 'reserved'
  }, {
    n: 5,
    status: 'occupied',
    total: 620
  }, {
    n: 6,
    status: 'free'
  }, {
    n: 7,
    status: 'occupied',
    total: 150
  }, {
    n: 8,
    status: 'free'
  }],
  categorias: ['Cervezas', 'Cocteles', 'Alitas y botanas'],
  productos: [{
    name: 'Michelada',
    price: 90,
    cat: 'Cervezas'
  }, {
    name: 'Cerveza nacional',
    price: 55,
    cat: 'Cervezas'
  }, {
    name: 'Margarita',
    price: 120,
    cat: 'Cocteles'
  }, {
    name: 'Paloma',
    price: 110,
    cat: 'Cocteles'
  }, {
    name: 'Alitas BBQ (12pz)',
    price: 210,
    cat: 'Alitas y botanas'
  }, {
    name: 'Papas gajo',
    price: 95,
    cat: 'Alitas y botanas'
  }],
  activas: [{
    n: 2,
    total: 320,
    mins: 22
  }, {
    n: 5,
    total: 620,
    mins: 70
  }, {
    n: 7,
    total: 150,
    mins: 9
  }],
  inventario: [{
    name: 'Cerveza nacional',
    stock: 142,
    unit: 'botellas',
    low: false
  }, {
    name: 'Tequila reposado',
    stock: 6,
    unit: 'litros',
    low: true
  }, {
    name: 'Limón',
    stock: 3,
    unit: 'kg',
    low: true
  }, {
    name: 'Hielo',
    stock: 40,
    unit: 'kg',
    low: false
  }],
  meseros: [{
    name: 'Jorge',
    ventas: 2340
  }, {
    name: 'Ana',
    ventas: 1890
  }, {
    name: 'Luis',
    ventas: 3120
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mesero-movil/data.js", error: String((e && e.message) || e) }); }

// ui_kits/shared/roles.js
try { (() => {
window.POS_ROLES = {
  mesero: {
    value: 'mesero',
    label: 'Mesero',
    sections: ['mesas']
  },
  gerente: {
    value: 'gerente',
    label: 'Gerente',
    sections: ['mesas', 'inventario', 'reportes', 'usuarios']
  }
};
window.POS_NAV_ITEMS = [{
  key: 'mesas',
  label: 'Mesas',
  icon: 'https://unpkg.com/lucide-static/icons/layout-grid.svg'
}, {
  key: 'inventario',
  label: 'Inventario',
  icon: 'https://unpkg.com/lucide-static/icons/boxes.svg'
}, {
  key: 'reportes',
  label: 'Reportes',
  icon: 'https://unpkg.com/lucide-static/icons/bar-chart-3.svg'
}, {
  key: 'usuarios',
  label: 'Usuarios',
  icon: 'https://unpkg.com/lucide-static/icons/users.svg'
}];
window.POS_STAFF = [{
  name: 'Jorge Martinez',
  role: 'Gerente',
  status: 'Activo'
}, {
  name: 'Ana Ruiz',
  role: 'Mesero',
  status: 'Activo'
}, {
  name: 'Luis Peña',
  role: 'Mesero',
  status: 'Activo'
}, {
  name: 'Karla Soto',
  role: 'Barra',
  status: 'Inactivo'
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/shared/roles.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.NumericStepper = __ds_scope.NumericStepper;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.AppShellDesktop = __ds_scope.AppShellDesktop;

__ds_ns.AppShellMobile = __ds_scope.AppShellMobile;

__ds_ns.LoginCard = __ds_scope.LoginCard;

__ds_ns.MenuItemRow = __ds_scope.MenuItemRow;

__ds_ns.TableTile = __ds_scope.TableTile;

})();
