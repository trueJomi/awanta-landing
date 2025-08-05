import type { WrapperModel } from "../types/wrapper.type"

export class FetchApi {
  private readonly baseUrl: string

  constructor (baseUrl: string) {
    this.baseUrl = baseUrl
  }


  async POST<T> (url: string, body: any, query?: Record<string, string>) {
    let urlFinal = this.baseUrl + url
    if (query !== undefined) {
      const queryParams = new URLSearchParams(query)
      urlFinal += '?' + queryParams.toString()
    }
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    const response = await fetch(urlFinal, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    const result: WrapperModel<T> = await response.json()
    if (!result.status) {
      throw new Error(result.message)
    }
    return result.data
  }

  async GET<T> (url: string, query?: any) {
    let urlFinal = this.baseUrl + url
    if (query !== undefined) {
      const queryParams = new URLSearchParams()
      for (const key in query) {
        queryParams.set(key, query[key] as string)
      }
      urlFinal += '?' + queryParams.toString()
    }
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    const response = await fetch(urlFinal, {
      method: 'GET',
      headers
    })
    const result: WrapperModel<T> = await response.json()
    if (!result.status) {
      throw new Error(result.message)
    }
    return result.data
  }

  async PUT<T> (url: string, body: any, query?: any) {
    let urlFinal = this.baseUrl + url
    if (query !== undefined) {
      const queryParams = new URLSearchParams()
      for (const key in query) {
        queryParams.set(key, query[key] as string)
      }
      urlFinal += '?' + queryParams.toString()
    }
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    const response = await fetch(urlFinal, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    })
    const result: WrapperModel<T> = await response.json()
    if (!result.status) {
      throw new Error(result.message)
    }
    return result.data
  }

  async DELETE<T> (url: string, query?: any) {
    let urlFinal = this.baseUrl + url
    if (query !== undefined) {
      const queryParams = new URLSearchParams()
      for (const key in query) {
        queryParams.set(key, query[key] as string)
      }
      urlFinal += '?' + queryParams.toString()
    }
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    const response = await fetch(urlFinal, {
      method: 'DELETE',
      headers
    })
    const result: WrapperModel<T> = await response.json()
    if (!result.status) {
      throw new Error(result.message)
    }
    return result.data
  }
}
