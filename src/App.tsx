import AppRouter from "./router/AppRouter";
import InstallBanner from "./components/InstallBanner";

import { useEffect } from "react";
import { NotificationService } from "./services/notificationService";

function App() {
  useEffect(() => {
    NotificationService.requestPermissions();
  }, []);

  return (
    <>
      <InstallBanner />
      <AppRouter />
    </>
  );
}

export default App;
