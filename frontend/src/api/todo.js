import request from '@/utils/request';

export function getTodoList(query) {
  return request({
    url: '/api/todo',
    method: 'get',
    params: query
  });
}

export function getTodoDetail(id) {
  return request({
    url: `/api/todo/${id}`,
    method: 'get'
  });
}

export function createTodo(data) {
  return request({
    url: '/api/todo',
    method: 'post',
    data
  });
}

export function updateTodo(id, data) {
  return request({
    url: `/api/todo/${id}`,
    method: 'put',
    data
  });
}

export function deleteTodo(id) {
  return request({
    url: `/api/todo/${id}`,
    method: 'delete'
  });
}