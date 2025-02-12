require("dotenv").config()

module.exports = {
    contracts_directory: "./contracts",
    contracts_build_directory: "./tronbox/build",
    migrations_directory: "./tronbox/migrations",
    networks: {
        development: {
            mnemonic: process.env.MNEMONIC,
            userFeePercentage: 100, // The percentage of resource consumption ratio.
            feeLimit: 1000 * 1e6, // The TRX consumption limit for the deployment and trigger, unit is SUN
            fullHost: "http://localhost:9090",
            // fullNode: "https://api.nileex.io",
            // solidityNode: "https://api.nileex.io",
            // eventServer: "https://event.nileex.io",
            network_id: "*", // Матч для любого network_id
        },
        shasta: {
            privateKey: process.env.NILE_PRIVATE_KEY,
            userFeePercentage: 50,
            feeLimit: 1000 * 1e6,
            fullHost: "https://api.shasta.trongrid.io",
            network_id: "2",
        },
        nile: {
            privateKey: process.env.NILE_PRIVATE_KEY,
            userFeePercentage: 100,
            feeLimit: 1000 * 1e6,
            fullHost: "https://api.nileex.io",
            network_id: "3",
        },
        compilers: {
            solc: {
                version: "0.8.22",
            },
        },
    },
    // solc compiler optimize
    solc: {
        optimizer: {
            enabled: true,
            runs: 200,
        },
    },
}
