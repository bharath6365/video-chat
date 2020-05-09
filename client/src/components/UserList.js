import React from 'react';
import { Button, Card, Image } from 'semantic-ui-react';

export default function UserList({ users, yourID, handleClick, yourStream }) {
  return (
    <section className="user-list">
      <h1 className="align-center">Users online</h1>
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
          const avatarID = Math.floor(Math.random() * (9 - 1) + 1);
          return (
            <Card>
              <Card.Content>
                <Image floated="right" size="mini" src={`https://randomuser.me/api/portraits/lego/${avatarID}.jpg`} />
                <Card.Header>{userName}</Card.Header>
                <Card.Meta>{available ? 'Available': 'Busy'}</Card.Meta>
              </Card.Content>
              <Card.Content extra>
                <div className="ui two buttons">
                  <Button disabled={available ? false : true} onClick={() => handleClick(key, yourStream)} color="green">
                    Call
                  </Button>
                </div>
              </Card.Content>
            </Card>
          );
        })}
      </Card.Group>
    </section>
  );
}
