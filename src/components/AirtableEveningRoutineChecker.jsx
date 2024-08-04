import React, { useEffect, useState } from 'react';
import Airtable from 'airtable';

const API_KEY = 'patVbjyd0PZMJPOoh.b53bd522d4f26b84883b86202c4d589dae3fb8f3f1f87e95a0a5d47e49d12ed2';
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
        view: "Grid view",
        filterByFormula: "{Today} = 'Today'"
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
      const fieldsToUpdate = {
        'Sub Category': updatedFields['Sub Category'],
        Details: updatedFields.Details,
        Done: updatedFields.Done
      };
      
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

  const groupByCategory = (items) => {
    return items.reduce((acc, item) => {
      (acc[item.Category] = acc[item.Category] || []).push(item);
      return acc;
    }, {});
  };

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data) return <div className="text-gray-500">Loading...</div>;

  const groupedData = groupByCategory(data);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">Daily Log</h1>
      <h2 className="text-xl font-semibold mb-6">{new Date().toLocaleDateString()}</h2>
      {data && data.length === 0 && (
        <p className="text-gray-500">No entries found for today.</p>
      )}
      {Object.entries(groupedData).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">{category}</h3>
          <ul className="space-y-2">
          {items.map(item => (
  <li key={item.id} className="mb-2">
    {editingId === item.id ? (
      <EditForm item={item} onSave={handleSave} onCancel={handleCancel} />
    ) : (
      <div>
        <strong>{item['Sub Category']}:</strong> {item.Details} - 
        <span className={item.Done ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
          {item.Done ? "Yes" : "No"}
        </span>
        <span className="ml-1">- </span>
        
          href="#"
          onClick={(e) => { e.preventDefault(); handleEdit(item.id); }}
          className="text-blue-500 hover:text-blue-700"
        >
          Edit
        </a>
      </div>
    )}
  </li>
))}
          </ul>
        </div>
      ))}
    </div>
  );
};

const EditForm = ({ item, onSave, onCancel }) => {
  const [fields, setFields] = useState({
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