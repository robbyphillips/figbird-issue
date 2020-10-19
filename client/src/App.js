import React, { useState } from 'react';
import io from 'socket.io-client';
import feathers from '@feathersjs/client';
import { Provider, useFind, useMutation } from 'figbird';
import sift, { createEqualsOperation } from 'sift'; // note, this is only available as an indirect dependency used by figbird
import filterQuery from 'figbird/dist/esm/filterQuery';

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

// from https://gist.github.com/donmccurdy/6d073ce2c6f3951312dfa45da14a420f ¯\_(ツ)_/¯
function wildcardToRegExp (s) {
  return new RegExp('^' + s.split(/%+/).map(regExpEscape).join('.*') + '$');
}

function regExpEscape (s) {
  return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

function matcher() {
  return query => {
    // first utilise the 'operators' option to allow $like
    // see https://github.com/feathersjs/databases/blob/87c7c29ef017b3cae135e7b7597a7e63fb7d0961/packages/adapter-commons/src/filter-query.ts#L105
    // or https://github.com/humaans/figbird/blob/e2114985a0158ffd352c9cecca8cf3d77b84015a/lib/filterQuery.js#L33
    const filteredQuery = filterQuery(query, { operators: ['$like'] });

    // and then configure sift with the custom $like implementation
    // see https://github.com/crcn/sift.js#custom-operations
    const sifter = sift(filteredQuery, {
      operations: {
        $like(expr, ownerQuery, options) {
          return createEqualsOperation(
            value => wildcardToRegExp(expr).test(value),
            ownerQuery,
            options
          );
        }
      }
    });

    return item => sifter(item);
  }
}

function Things({ text }) {
  const { status, data, error } = useFind('things', {
    query: { text: { $like: `%${text}%` } },
    // Provide a custom matcher, since neither Feathers core,
    // nor sift supports $like operator by default
    matcher
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
