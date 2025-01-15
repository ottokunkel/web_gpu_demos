   const path = require("path");
   const HtmlWebpackPlugin = require("html-webpack-plugin");

   module.exports = (env) => {
       const entryPoint = env.entry || "demo-1"; // Default to "demo-1" if no entry is specified

       return {
           entry: {
               [entryPoint]: `./demos/${entryPoint}/src/index.js`,
           },
           output: {
               filename: "[name].bundle.js",
               path: path.resolve(__dirname, "dist"),
           },
           mode: "development",
           plugins: [
               new HtmlWebpackPlugin({
                   template: `./demos/${entryPoint}/index.html`,
                   filename: "index.html",
                   chunks: [entryPoint],
                   scriptLoading: "defer",
               }),
           ],
       };
   };