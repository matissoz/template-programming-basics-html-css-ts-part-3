const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Dynamically get all exercise folders
const exercisesDir = path.resolve(__dirname, "src", "exercises");
const exerciseFolders = fs
  .readdirSync(exercisesDir)
  .filter((dir) => dir.startsWith("exercise"));

// Create entry points for each exercise
const exerciseEntries = exerciseFolders.reduce((entries, folder) => {
  entries[folder] = [
    `./src/exercises/${folder}/scripts.ts`,
    `./src/exercises/${folder}/styles.scss`,
  ];
  return entries;
}, {});

module.exports = {
  entry: {
    main: ["./src/scripts.ts", "./src/styles.scss"],
    ...exerciseEntries,
  },
  mode: "development",
  devServer: {
    port: 3000,
    historyApiFallback: true,
    client: {
      logging: "none",
    },
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
      favicon: "favicon.png",
      chunks: ["main"],
      filename: "index.html",
    }),
    // Dynamically add HtmlWebpackPlugin for each exercise
    ...exerciseFolders.map(
      (folder) =>
        new HtmlWebpackPlugin({
          template: `src/exercises/${folder}/index.html`,
          chunks: [folder],
          filename: `exercises/${folder}/index.html`,
        })
    ),
    new MiniCssExtractPlugin({
      filename: (chunkData) => {
        if (chunkData.chunk.name === 'main') {
          return '[name].css';
        }
        return 'exercises/[name]/[name].css';
      },
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "src/assets",
          to: "assets",
        },
      ],
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: (chunkData) => {
      if (chunkData.chunk.name === 'main') {
        return '[name].js';
      }
      return 'exercises/[name]/[name].js';
    },
  },
};
