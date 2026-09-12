import { Layout } from "./components/layout/Layout";
import Home from "./pages/Home";
import Market from "./pages/Market";
import Gainers from "./pages/Gainers";
import Losers from "./pages/Losers";
import Trending from "./pages/Trending";
import Memecoins from "./pages/Memecoins";
import News from "./pages/News";
import FearGreed from "./pages/FearGreed";
import Calendar from "./pages/Calendar";
import CryptoDetail from "./pages/CryptoDetail";
import PostGenerator from "./pages/PostGenerator";
import NotFound from "./pages/NotFound";

export const routers = [
  {
    path: "/",
    name: "layout",
    element: <Layout />,
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
