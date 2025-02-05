package priorityqueue

import (
	"container/heap"
	"iter"
	"sync"
	"time"
)

// Item represents an element in the priority queue.
type Item[T any] struct {
	Value    T         // The value of the item; arbitrary.
	priority time.Time // The priority of the item in the queue, based on time.
	index    int       // The index of the item in the heap.
}

// A PriorityQueue implements heap.Interface and holds Items.
type PriorityQueue[T any] []*Item[T]

func (pq PriorityQueue[T]) Len() int { return len(pq) }

func (pq PriorityQueue[T]) Less(i, j int) bool {
	// We want Pop to give us the highest priority (earliest time) item, so we use less than here.
	return pq[i].priority.Before(pq[j].priority)
}

func (pq PriorityQueue[T]) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
	pq[i].index = i
	pq[j].index = j
}

func (pq *PriorityQueue[T]) Push(x any) {
	n := len(*pq)
	item := x.(*Item[T])
	item.index = n
	*pq = append(*pq, item)
}

func (pq *PriorityQueue[T]) Pop() any {
	old := *pq
	n := len(old)
	item := old[n-1]
	old[n-1] = nil  // avoid memory leak
	item.index = -1 // for safety
	*pq = old[0 : n-1]
	return item
}

type ThreadSafeQueue[T Identifier] struct {
	pq    *PriorityQueue[T]
	mu    sync.RWMutex
	cache sync.Map
}

type Identifier interface {
	ID() string
}

func NewPriorityQueue[T Identifier]() *ThreadSafeQueue[T] {
	pq := &PriorityQueue[T]{}
	heap.Init(pq)
	return &ThreadSafeQueue[T]{pq, sync.RWMutex{}, sync.Map{}}
}

func (q *ThreadSafeQueue[T]) Push(t T, ttl time.Duration) {
	q.mu.Lock()
	defer q.mu.Unlock()

	if _, ok := q.cache.Load(t.ID()); ok {
		return
	}

	i := &Item[T]{
		Value:    t,
		priority: time.Now().Add(ttl),
	}

	heap.Push(q.pq, i)
	q.cache.Store(t.ID(), struct{}{})
}

func (q *ThreadSafeQueue[T]) Pop() *Item[T] {
	q.mu.Lock()
	defer q.mu.Unlock()

	if q.Len() == 0 {
		return nil
	}

	value := heap.Pop(q.pq).(*Item[T])
	q.cache.Delete(value.Value.ID())

	return value
}

func (q *ThreadSafeQueue[T]) Len() int {
	q.mu.RLock()
	defer q.mu.RUnlock()

	return q.pq.Len()
}

func (q *ThreadSafeQueue[T]) Peek() *Item[T] {
	q.mu.RLock()
	defer q.mu.RUnlock()

	if q.Len() == 0 {
		return nil
	}

	return (*q.pq)[0]
}

func (q *ThreadSafeQueue[T]) Items() iter.Seq[T] {
	q.mu.Lock()
	defer q.mu.Unlock()

	time := time.Now()

	return func(yield func(T) bool) {
		for item := q.Peek(); item != nil; item = q.Peek() {
			if item.priority.After(time) {
				break
			}

			item := q.Pop()
			if item == nil {
				break
			}

			if !yield(item.Value) {
				break
			}
		}
	}
}
