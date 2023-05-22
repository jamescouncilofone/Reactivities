import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { useState } from "react";
import { Button, Grid, Header, Tab } from "semantic-ui-react";
import ProfileEdit from "./ProfileEdit";

export default observer(function ProfileAbout() {
    const {profileStore} = useStore();
    const {isCurrentUser, profile} = profileStore;
    
    const [editMode, setEditMode] = useState(false);

    // NOTE: The style 'whiteSpace: 'pre-wrap' will preserve line breaks that are entered into the text area.
    return (
        <Tab.Pane>
            <Grid>
                <Grid.Column width='16'>
                    <Header floated='left' icon='user' content={`About ${profile?.displayName}`} />

                    {isCurrentUser && (
                        <Button 
                            floated='right'
                            basic
                            content={editMode ? 'Cancel' : 'Edit Profile'}
                            onClick={() => setEditMode(!editMode)}
                        />
                    )}
                </Grid.Column>

                <Grid.Column width='16'>
                    {editMode 
                        ? <ProfileEdit setEditMode={setEditMode} /> 
                        : <span style={{whiteSpace: 'pre-wrap'}}>
                            {profile?.bio}
                    </span>}
                </Grid.Column>
            </Grid>
        </Tab.Pane>
    )
})