module.exports = {
    apps: [
        {
            name: "tilawah-tracker",
            script: "dist/index.js",
            watch: false,
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
