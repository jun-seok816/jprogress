const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/Jprogress.ts", // 또는 main TS
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "Jprogress.js",
    library: {
      type: "module"
    }
  },
  experiments: {
    outputModule: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/, // .js or .jsx
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
      {
        test: /\.(sc|c)ss$/, // .scss .css
        use: [
          //'cache-loader',
          //MiniCssExtractPlugin.loader,
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(png|jpg|gif|svg|webp)$/,
        loader: "file-loader",
        options: {
          name: "images/[name].[ext]",
        },
      },  
    ],
  },
  resolve: {
    extensions: [".ts", ".js"]
  }
};
