# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Решение проблем с авторизацией

Если у вас возникают проблемы со входом в систему:

### Тестовые учетные данные

- **Администратор:** 
  - Логин: `Admin` (или `admin` - регистр не важен)
  - Пароль: `admin148`

- **Пользователь:**
  - Логин: `Eurouser` (или `eurouser` - регистр не важен)
  - Пароль: `user148`

### Способы входа

1. **Автоматическое заполнение:** На странице входа есть кнопки "Админ" и "Пользователь", которые автоматически заполняют поля формы.

2. **Ручной ввод:** Вы можете ввести данные вручную. Логин не чувствителен к регистру.

3. **Сброс кэша:** Если авторизация не работает, нажмите кнопку "Сбросить кэш" внизу формы. Это очистит localStorage и восстановит данные пользователей по умолчанию.

### Отладка через консоль браузера

Откройте консоль разработчика (F12) и проверьте логи:

1. При загрузке страницы вы должны увидеть:
   - `Инициализация пользователей в localStorage` (если это первый запуск)
   - или `Пользователи уже есть в localStorage: [...]`

2. При попытке входа вы увидите:
   - `Попытка входа: {username: "...", password: "..."}`
   - `Доступные пользователи: [...]`
   - `Найденный пользователь: {...}` (если успешно)

3. Вручную проверить данные в localStorage:
```javascript
// В консоли браузера:
console.log(JSON.parse(localStorage.getItem('users')));
```

### Ручной сброс через консоль

Если кнопка "Сбросить кэш" не помогает, выполните в консоли браузера:

```javascript
localStorage.clear();
location.reload();
```
