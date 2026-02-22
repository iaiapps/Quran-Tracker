module.exports = {
    apps: [
        {
            name: "tilawah-tracker",
            script: "npx",
            args: "tsx src/index.tsx",
            interpreter: "none",
            watch: false,
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
