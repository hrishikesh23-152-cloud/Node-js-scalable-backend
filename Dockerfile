FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "dev"]
