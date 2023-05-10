import { makeAutoObservable, runInAction } from "mobx";
import { User, UserFormValues } from "../models/user";
import agent from "../api/agent";
import { store } from "./store";
import { router } from "../router/Routes";

export default class UserStore {
    user: User | null = null;

    constructor() {
        makeAutoObservable(this);
    }
    
    // NOTE: !! is casting the user object as a boolean in the computed property below.
    get isLoggedIn() {
        return !!this.user;
    }

    login = async(creds: UserFormValues) => {
        try {
            const user = await agent.Account.login(creds);
            store.commonStore.setToken(user.token);

            // This is running in the next tick, so have to use runInAction to set the user.
            runInAction(() => this.user = user);

            router.navigate('/activities');

            store.modalStore.closeModal();
        } catch (error) {
            throw error;
        }
    }

    register = async(creds: UserFormValues) => {
        try {
            const user = await agent.Account.register(creds);
            store.commonStore.setToken(user.token);

            // This is running in the next tick, so have to use runInAction to set the user.
            runInAction(() => this.user = user);

            router.navigate('/activities');

            store.modalStore.closeModal();
        } catch (error) {
            throw error;
        }
    }

    logout = () => {
        store.commonStore.setToken(null);
        this.user = null;

        // Navigate back to homepage.
        router.navigate('/');
    }

    getUser = async () => {
        try {
            const user = await agent.Account.current();
            runInAction(() => this.user = user);
        } catch (error) {
            console.log(error);
        }
    }
}