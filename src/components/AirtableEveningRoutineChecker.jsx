import React, { useEffect, useState } from 'react';
import Airtable from 'airtable';

const API_KEY = 'patVbjyd0PZMJPOoh.e00bfcdd76f3548b8777c4312571233d8c15114c55e053791419441a9e9b7dbc';
const BASE_ID = 'apptIOZabkjCpSYBG';
const TABLE_NAME = 'Daily Log';

Airtable.configure({
  apiKey: API_KEY
});

const base = Airtable.base(BASE_ID);

const AirtableEveningRoutineChecker = () => {
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log(`Connecting to Airtable... Base ID: ${BASE_ID}, Table: ${TABLE_NAME}`);
      
      base(TABLE_NAME).select({
        maxRecords: 100,
        view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {
        const items = records.map(record => ({
          id: record.id,
          ...record.fields
        }));
        setData(items);
        console.log('Records:', items);
      }, function done(err) {
        if (err) {
          console.error('Error fetching data:', err);
          setError(err.message);
        }
      });
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message);
    }
  };

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleSave = async (id, updatedFields) => {
    try {
      // Explicitly select only the fields we want to update
      const fieldsToUpdate = {
        Day: updatedFields.Day,
        Category: updatedFields.Category,
        'Sub Category': updatedFields['Sub Category'],
        Details: updatedFields.Details,
        Done: updatedFields.Done
      };
      
      await base(TABLE_NAME).update(id, fieldsToUpdate);
      setEditingId(null);
      fetchData(); // Refresh data after update
    } catch (err) {
      console.error('Error updating record:', err);
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Daily Log Items</h1>
      <div className="grid gap-4">
        {data.map(item => (
          <div key={item.id} className="bg-white shadow rounded p-4">
            {editingId === item.id ? (
              <EditForm item={item} onSave={handleSave} onCancel={handleCancel} />
            ) : (
              <div>
                <p><strong>ID:</strong> {item.ID}</p>
                <p><strong>Day:</strong> {item.Day}</p>
                <p><strong>Category:</strong> {item.Category}</p>
                <p><strong>Sub Category:</strong> {item['Sub Category']}</p>
                <p><strong>Details:</strong> {item.Details}</p>
                <p><strong>Done:</strong> {item.Done ? 'Yes' : 'No'}</p>
                <button 
                  onClick={() => handleEdit(item.id)}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const EditForm = ({ item, onSave, onCancel }) => {
  const [fields, setFields] = useState({
    Day: item.Day || '',
    Category: item.Category || '',
    'Sub Category': item['Sub Category'] || '',
    Details: item.Details || '',
    Done: item.Done || false
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFields({ ...fields, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item.id, fields);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        name="Day"
        value={fields.Day}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Day"
      />
      <input
        type="text"
        name="Category"
        value={fields.Category}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Category"
      />
      <input
        type="text"
        name="Sub Category"
        value={fields['Sub Category']}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Sub Category"
      />
      <input
        type="text"
        name="Details"
        value={fields.Details}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Details"
      />
      <div className="flex items-center">
        <input
          type="checkbox"
          name="Done"
          checked={fields.Done}
          onChange={handleChange}
          className="mr-2"
        />
        <label htmlFor="Done">Done</label>
      </div>
      <div className="flex space-x-2">
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Save
        </button>
        <button type="button" onClick={onCancel} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AirtableEveningRoutineChecker;