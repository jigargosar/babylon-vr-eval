import basicSsl from '@vitejs/plugin-basic-ssl'
import {defineConfig} from 'vite';


export default defineConfig({
    server: {
        host: true,
    },
    plugins: [basicSsl()],
});
