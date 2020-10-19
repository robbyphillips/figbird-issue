import React, { useState } from 'react';
import io from 'socket.io-client';
import feathers from '@feathersjs/client';
import { Provider, useFind, useMutation } from 'figbird';

const socket = io('http://localhost:3030');
const client = feathers();

client.configure(feathers.socketio(socket));
client.configure(
  feathers.authentication({
    storage: window.localStorage,
  })
);

function App() {
  const [searchValue, setSearchValue] = useState('');

  return (
    <Provider feathers={client}>
      <div>
        <form>
          <input
            type="text"
            value={searchValue}
            placeholder="search"
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>
      </div>
      <CreateThings />
      <Things text={searchValue} />
    </Provider>
  );
}

function CreateThings() {
  const [createValue, setCreateValue] = useState('');
  const { create } = useMutation('things');

  const handleCreate = (e) => {
    e.preventDefault();
    create({ text: createValue }).catch((err) =>
      console.log('create err: ', err)
    );
  };

  return (
    <div>
      <form>
        <input
          type="text"
          value={createValue}
          onChange={(e) => setCreateValue(e.target.value)}
        />
        <button onClick={handleCreate}>create thing</button>
      </form>
    </div>
  );
}

function Things({ text }) {
  const { status, data, error } = useFind('things', {
    query: { text: { $like: `%${text}%` } },
    realtime: 'refetch'
  });

  if (status === 'loading') {
    return 'Loading...';
  } else if (status === 'error') {
    return error.message;
  }

  return (
    <div>
      <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
}

export default App;
