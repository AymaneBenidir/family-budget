import Analysis from './pages/Analysis';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Goals from './pages/Goals';
import Incomes from './pages/Incomes';
import Landing from './pages/Landing';
import Reports from './pages/Reports';
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import SelectPlan from './pages/SelectPlan';
import PlanSelection from './pages/PlanSelection';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Analysis": Analysis,
    "Dashboard": Dashboard,
    "Expenses": Expenses,
    "Goals": Goals,
    "Incomes": Incomes,
    "Landing": Landing,
    "Reports": Reports,
    "SignIn": SignIn,
    "Home": Home,
    "SelectPlan": SelectPlan,
    "PlanSelection": PlanSelection,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};