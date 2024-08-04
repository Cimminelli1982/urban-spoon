import React, { useEffect, useState } from 'react';
import Airtable from 'airtable';

const API_KEY = 'patVbjyd0PZMJPOoh.e00bfcdd76f3548b8777c4312571233d8c15114c55e053791419441a9e9b7dbc';
const BASE_ID = 'apptIOZabkjCpSYBG';
const TABLE_NAME = 'Daily Log';

Airtable.configure({
  apiKey: API_KEY,
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

  if (error) return <div className="text-red-600 text-center p-4">Error: {error}</div>;
  if (!data) return <div className="text-gray-600 text-center p-4">Loading...</div>;

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {data.map(item => (
            <div
              key={item.id}
              className={`rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden ${item.Done ? 'bg-green-200' : 'bg-red-200'}`}
            >
              {editingId === item.id ? (
                <EditForm item={item} onSave={handleSave} onCancel={handleCancel} />
              ) : (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">{item.Details}</h2>
                  <span className={`inline-block text-xs px-2 py-1 rounded-full mb-4 ${item['Sub Category'] === 'Breakfast' ? 'bg-green-300 text-green-800' : item['Sub Category'] === 'Lunch' ? 'bg-yellow-300 text-yellow-800' : 'bg-gray-300 text-gray-800'}`}>
                    {item['Sub Category']}
                  </span>
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 duration-300"
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
    <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-gray-50 rounded-lg shadow-lg">
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
        <button type="submit" className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 duration-300">
          Save
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105 duration-300">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AirtableEveningRoutineChecker;
