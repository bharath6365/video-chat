import React, {useState} from 'react';
import { Button, Card, Image } from 'semantic-ui-react';

import NotFound from './NotFound';

export default function UserList({ users, yourID, handleClick, yourStream }) {

  const [buttonLoading, setButtonLoading] = useState(false)

  const handleButtonClick = (key, yourStream) => {
    setButtonLoading(true);

    handleClick(key, yourStream).finally(() => {
      setButtonLoading(false);
    })
  }

  const usersOnline = Object.keys(users).length;
  return (
    <section className="user-list">
      <h1 className="align-center">Users online</h1>
      {/* Obviously you are online  */}
      {usersOnline > 1 && (
        <Card.Group>
          {Object.keys(users).map((key) => {
            const random = Math.random() * (100 - 0);
            const userName = users[key].name;
            const available = users[key].available;
            // You dont want to call yourself for heaven sake.
            if (key === yourID || userName === null) {
              return null;
            }

            // There are 12 random avatar's available. On Every render assign a random avatar.
            const avatarID = users[key].avatarNumber;
            return (
              <Card>
                <Card.Content>
                  <Image floated="right" size="mini" src={`https://randomuser.me/api/portraits/lego/${avatarID}.jpg`} />
                  <Card.Header>{userName}</Card.Header>
                  <Card.Meta>{available ? 'Available' : 'Busy'}</Card.Meta>
                </Card.Content>
                <Card.Content extra>
                  <div className="ui two buttons">
                    <Button
                      loading={buttonLoading}
                      disabled={available ? false : true}
                      onClick={() => handleButtonClick(key, yourStream)}
                      color="green"
                    >
                      Call
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            );
          })}
        </Card.Group>
      )}

      {usersOnline <= 1 && <NotFound />}
    </section>
  );
}
