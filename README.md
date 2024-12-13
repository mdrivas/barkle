# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [Shadcn UI](https://ui.shadcn.com)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

# How to run the project

1. Create .env file by copying .env.example and filling in the required fields, define your database name in the start-database.sh script. Ensure docker is running and installed. You can leave the database password as "password" and it will be generated for you or change it to your desired password.
DONT DIS 2. Run `./start-database.sh` to start a local postgres database in a docker container
DONT DO DIS 3. Run `npm run db:push` to push default migrations
4. Run `npm install` to install the dependencies -> I am using node v18.17.0
5. Run `npm run dev` to start the development server :)

# Configuration Instructions

## Database Setup

1. Run `./start-database.sh` to start a local postgres database in a docker container
2. Run `npm run db:push` to push the models to the database
3. Update your schema in `drizzle/schema.ts`
4. Run `npm run db:push` to push the new schema to the database
5. We can leverage InferSelectModel and InferInsertModel to type our queries and mutations so we can use them in our tRPC routes and app for type safety. When we update schema our types will automatically be updated and reflected.

## TRPC Setup

1. All TRPC routes are defined in `src/server/api/routers`
2. Add new TRPC routers in `src/server/api/routers`
3. Resolve TRPC router imports in `src/server/api/root.ts` by adding them to the `createTRPCRouter` function
4. Call TRPC routes within the app, see post as example, this creates a tunnel from the frontend to the backend in a type safe manner
5. Read into queries and mutations, queries are used for read only data that is fetched on the client side by default on load and mutations are used for write operations

## Auth Setup

1. Add auth providers to `src/server/auth.ts`
2. Include proper environment variables for auth providers in `.env` and `src/env.js`

## Shadcn UI Component Setup

1. Shadcn UI components are located in `src/components/ui`
2. Use npx shadcn-ui@latest add {component} to add a new component it will automatically update the `src/components/ui/index.tsx` file
3. Reference the website for the component you want to use here: https://ui.shadcn.com/

## Testing

1. Run `npm run test` to run the tests
2. Run `npm run test:watch` to run the tests in watch mode
3. Run `npm run test:coverage` to run the tests and generate a coverage report
4. Run `npm run test:ui` to run the tests in interactive watch mode


Test commit 12/13/2024