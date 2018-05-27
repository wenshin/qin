const qin = require('qin-server');
const User = require('user.vue');

app = qin.createApp();

app.use(apiRoutes);
app.use(uiRoutes);
