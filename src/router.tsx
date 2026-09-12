import { lazy } from "react";
import { Layout } from "./components/layout/Layout";
import { RouteErrorPage } from "./components/RouteErrorPage";

const Home = lazy(() => import("./pages/Home"));
const Market = lazy(() => import("./pages/Market"));
const Gainers = lazy(() => import("./pages/Gainers"));
const Losers = lazy(() => import("./pages/Losers"));
const Trending = lazy(() => import("./pages/Trending"));
const Memecoins = lazy(() => import("./pages/Memecoins"));
const News = lazy(() => import("./pages/News"));
const FearGreed = lazy(() => import("./pages/FearGreed"));
const Calendar = lazy(() => import("./pages/Calendar"));
const CryptoDetail = lazy(() => import("./pages/CryptoDetail"));
const PostGenerator = lazy(() => import("./pages/PostGenerator"));
const NotFound = lazy(() => import("./pages/NotFound"));

export const routers = [
  {
    path: "/",
    name: "layout",
    element: <Layout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: "/",
        name: "home",
        element: <Home />,
      },
      {
        path: "/market",
        name: "market",
        element: <Market />,
      },
      {
        path: "/gainers",
        name: "gainers",
        element: <Gainers />,
      },
      {
        path: "/losers",
        name: "losers",
        element: <Losers />,
      },
      {
        path: "/trending",
        name: "trending",
        element: <Trending />,
      },
      {
        path: "/memecoins",
        name: "memecoins",
        element: <Memecoins />,
      },
      {
        path: "/news",
        name: "news",
        element: <News />,
      },
      {
        path: "/fear-greed",
        name: "fear-greed",
        element: <FearGreed />,
      },
      {
        path: "/calendar",
        name: "calendar",
        element: <Calendar />,
      },
      {
        path: "/crypto/:id",
        name: "crypto-detail",
        element: <CryptoDetail />,
      },
      {
        path: "/post-generator",
        name: "post-generator",
        element: <PostGenerator />,
      },
      /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
      {
        path: "*",
        name: "404",
        element: <NotFound />,
      },
    ],
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
