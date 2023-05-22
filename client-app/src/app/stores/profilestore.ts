import { makeAutoObservable, runInAction } from "mobx";
import { Photo, Profile } from "../models/profile";
import agent from "../api/agent";
import { store } from "./store";

export default class ProfileStore {
    profile: Profile | null = null;
    loadingProfile = false;
    uploading = false;
    loading = false;

    constructor() {
        makeAutoObservable(this);
    }

    // NOTE: MobX has the User and Profile. So use a computed property to check if the profile currently
    //       loaded is the currently logged in user.
    get isCurrentUser() {
        if (store.userStore.user && this.profile) {
            return store.userStore.user.username === this.profile.username;
        }

        return false;
    }

    loadProfile = async (username: string) => {
        this.loadingProfile = true;

        try {
            const profile = await agent.Profiles.get(username);
            runInAction(() => {
                this.profile = profile;
                this.loadingProfile = false;
            })
        } catch (error) {
            console.log(error);
            runInAction(() => this.loadingProfile = false);
        }
    }

    uploadPhoto = async (file: Blob) => {
        this.uploading = true;

        try {
            const response = await agent.Profiles.uploadPhoto(file);
            const photo = response.data;

            runInAction(() => {
                if (this.profile) {
                    this.profile.photos?.push(photo);

                    if (photo.isMain && store.userStore.user) {
                        store.userStore.setImage(photo.url);
                        this.profile.image = photo.url;
                    }
                }
                this.uploading = false;
            })
        } catch (error) {
            console.log(error);
            runInAction(() => this.uploading = false);
        }
    }

    setMainPhoto = async (photo: Photo) => {
        this.loading = true;

        try {
            await agent.Profiles.setMainPhoto(photo.id);
            store.userStore.setImage(photo.url);

            runInAction(() => {
                if (this.profile && this.profile.photos) {
                    // Set the current main photo to false.
                    this.profile.photos.find(p => p.isMain)!.isMain = false;

                    // Set the photo that is being updated to the main photo.
                    this.profile.photos.find(p => p.id === photo.id)!.isMain = true;

                    this.profile.image = photo.url;
                    this.loading = false;
                }
            })
        } catch (error) {
            runInAction(() => this.loading = false);
            console.log(error);
        }
    }

    deletePhoto = async (photo: Photo) => {
        this.loading = true;

        try {
            await agent.Profiles.deletePhoto(photo.id);

            runInAction(() => {
                if (this.profile) {
                    // Get a new array of all the photos except for the image that matches the id of being passed in.
                    this.profile.photos = this.profile.photos?.filter(p => p.id !== photo.id);
                    this.loading = false;
                }
            })
        } catch (error) {
            runInAction(() => this.loading = false);
            console.log(error);
        }
    }

    updateProfile = async (profile: Partial<Profile>) => {
        this.loading = true;

        try {
            await agent.Profiles.updateProfile(profile);

            runInAction(() => {
                if (profile.displayName && profile.displayName !== store.userStore.user?.displayName) {
                    store.userStore.setDisplayName(profile.displayName);
                }

                // We are setting the Profile with the existing profile and overwriting any changes to the
                // profile from the partial profile we are passing in as a parameter so we need to make use
                // of the 'as Profile' to make TypeScript happy.
                this.profile = {...this.profile, ...profile as Profile};
                this.loading = false;
            })


        } catch (error) {
            console.log(error);
            runInAction(() => this.loading = false);
        }
    }
}