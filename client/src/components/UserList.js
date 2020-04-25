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
          // You dont want to call yourself for heaven sake.
          if (key === yourID || userName === null) {
            return null;
          }
          return (
            <Card>
              <Card.Content>
                <Image floated="right" size="mini" src="https://react.semantic-ui.com/images/avatar/large/steve.jpg" />
                <Card.Header>{userName}</Card.Header>
                <Card.Meta>Available.</Card.Meta>
              </Card.Content>
              <Card.Content extra>
                <div className="ui two buttons">
                  <Button onClick={() => handleClick(key, yourStream)} basic color="green">
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
