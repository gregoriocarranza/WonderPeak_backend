var currentBackground,
  backgrounds = [
    'https://images.unsplash.com/photo-1458668383970-8ddd3927deed?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&s=1e9d6264da3ae9cacdddcad3b63f3c04',
    'https://images.unsplash.com/photo-1458668383970-8ddd3927deed?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&s=1e9d6264da3ae9cacdddcad3b63f3c04',
    'https://images.unsplash.com/photo-1463003416389-296a1ad37ca0?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&s=1bed2a6743851633b655ae774c15ac07',
  ];

currentBackground = Math.floor(Math.random() * backgrounds.length);
document.getElementsByClassName('bg')[0].src = backgrounds[currentBackground];
document.getElementsByClassName('form-bg')[0].src =
  backgrounds[currentBackground];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resetPasswordForm');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const errorMessage = document.getElementById('errorMessage');
  const submitButton = document.getElementById('submitButton');

  const API_BASE_URL = 'https://wonderpeak.uade.susoft.com.ar/';
  errorMessage.style.visibility = 'hidden';

  // Función para validar la contraseña
  const validatePassword = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasTwoNumbers = password.replace(/[^0-9]/g, '').length >= 2;
    if (!hasUppercase || !hasTwoNumbers) {
      errorMessage.style.visibility = 'visible';
      return 'La contraseña debe contener al menos una mayúscula y dos números.';
    }
    return null;
  };

  form.addEventListener('submit', async (event) => {
    errorMessage.style.visibility = 'hidden';
    errorMessage.textContent = '';
    event.preventDefault();

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!password || !confirmPassword) {
      errorMessage.style.visibility = 'visible';
      errorMessage.textContent =
        'Debe ingresar una contraseña para poder continuar.';
      return;
    }
    // Validar contraseña
    const validationError = validatePassword(password);
    if (validationError) {
      errorMessage.style.visibility = 'visible';
      errorMessage.textContent = validationError;
      return;
    }

    if (password !== confirmPassword) {
      errorMessage.style.visibility = 'visible';
      errorMessage.textContent = 'Las contraseñas no coinciden.';
      return;
    }

    submitButton.disabled = true;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const resetToken = urlParams.get('resetToken');

      const response = await fetch(
        `${API_BASE_URL}/api/auth/reset_password?resetToken=${resetToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contraseña: password }),
        }
      );

      if (response.ok) {
        alert('Contraseña restablecida correctamente.');
        window.location.href = '/reset_succesfully';
      } else {
        errorMessage.style.visibility = 'visible';
        errorMessage.textContent =
          'Hubo un error al restablecer la contraseña.';
      }
    } catch (error) {
      errorMessage.style.visibility = 'visible';
      console.error('Error:', error);
      errorMessage.textContent = 'Error al conectar con el servidor.';
    } finally {
      submitButton.disabled = false;
    }
  });
});
