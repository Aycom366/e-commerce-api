const agg = [
  {
    '$match': {
      'product': new ObjectId('61a5f374fd5399b4d7a78b07')
    }
  }, {
    '$group': {
      '_id': '$product', 
      'averageRating': {
        '$avg': '$rating'
      }, 
      'numOfReviews': {
        '$sum': 1
      }
    }
  }
];