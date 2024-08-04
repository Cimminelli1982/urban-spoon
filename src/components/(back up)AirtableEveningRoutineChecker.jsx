import React, { useEffect, useState } from 'react';
import Airtable from 'airtable';

const API_KEY = 'patVbjyd0PZMJPOoh.e00bfcdd76f3548b8777c4312571233d8c15114c55e053791419441a9e9b7dbc';
const BASE_ID = 'apptIOZabkjCpSYBG';
const TABLE_NAME = 'Daily log';

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
          id: record.getId(),
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
      const { id: _, ...fieldsToUpdate } = updatedFields;
      await base(TABLE_NAME).update(id, fieldsToUpdate);
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error('Error updating record:', err);
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  if (!data) return <div className="text-gray-500 text-center p-4">Loading...</div>;

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Daily Log Items</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {editingId === item.id ? (
                <EditForm item={item} onSave={handleSave} onCancel={handleCancel} />
              ) : (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">{item.Category}</h2>
                  <p className="text-gray-600 mb-2"><span className="font-medium">Day:</span> {item.Day}</p>
                  <p className="text-gray-600 mb-2"><span className="font-medium">Sub Category:</span> {item['Sub Category']}</p>
                  <p className="text-gray-600 mb-2"><span className="font-medium">Details:</span> {item.Details}</p>
                  <p className="text-gray-600 mb-4">
                    <span className="font-medium">Done:</span> 
                    <span className={`ml-2 px-2 py-1 rounded ${item.Done ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {item.Done ? 'Yes' : 'No'}
                    </span>
                  </p>
                  <button 
                    onClick={() => handleEdit(item.id)}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EditForm = ({ item, onSave, onCancel }) => {
  const [fields, setFields] = useState(item);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFields({ ...fields, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item.id, fields);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Day">Day</label>
        <input
          type="text"
          name="Day"
          value={fields.Day || ''}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Day"
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Category">Category</label>
        <input
          type="text"
          name="Category"
          value={fields.Category || ''}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Category"
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Sub Category">Sub Category</label>
        <input
          type="text"
          name="Sub Category"
          value={fields['Sub Category'] || ''}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Sub Category"
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Details">Details</label>
        <input
          type="text"
          name="Details"
          value={fields.Details || ''}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Details"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          name="Done"
          checked={fields.Done || false}
          onChange={handleChange}
          className="mr-2 form-checkbox h-5 w-5 text-blue-600"
        />
        <label className="text-gray-700 font-bold" htmlFor="Done">Done</label>
      </div>
      <div className="flex space-x-2">
        <button type="submit" className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300">
          Save
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AirtableEveningRoutineChecker;