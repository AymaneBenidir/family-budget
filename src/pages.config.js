import Analysis from './pages/Analysis';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Goals from './pages/Goals';
import Incomes from './pages/Incomes';
import Reports from './pages/Reports';
import Landing from './pages/Landing';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Analysis": Analysis,
    "Dashboard": Dashboard,
    "Expenses": Expenses,
    "Goals": Goals,
    "Incomes": Incomes,
    "Reports": Reports,
    "Landing": Landing,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};